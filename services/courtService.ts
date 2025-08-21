import { Court, Match, Player, TimeSlotRequest, SlotInfo, OpeningHours } from '../types';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// --- Data Mapping Layer ---
// This layer translates the API data structure into the frontend's expected format.

const mapPlayerFromApi = (apiPlayer: any): Player => {
    // Handles cases where the player object is nested (e.g., inside match.players)
    const playerData = apiPlayer.player || apiPlayer;
    const firstName = playerData.first_name || '';
    const lastName = playerData.last_name || '';
    return {
        id: playerData.id.toString(),
        name: `${firstName} ${lastName}`.trim(),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=random&color=fff`,
        role: playerData.is_admin ? 'admin' : 'player',
        phoneNumber: playerData.phone,
    };
};

const mapMatchFromApi = (apiMatch: any): Match => {
    let status: Match['status'] = 'ORGANIZING';
    switch (apiMatch.status) {
        case 'confirmed':
            status = 'CONFIRMED';
            break;
        case 'organizing':
            status = 'ORGANIZING';
            break;
        case 'booked':
            status = 'BOOKED';
            break;
        default:
            // Default to ORGANIZING for any unknown statuses to prevent crashes
            status = 'ORGANIZING'; 
            break;
    }

    return {
        id: apiMatch.id.toString(),
        court: {
            id: apiMatch.court.id.toString(),
            name: apiMatch.court.name,
        },
        start_time: apiMatch.start_time,
        end_time: apiMatch.end_time,
        // The API returns player join records, we extract the actual player data
        // and only include players who have accepted the invitation.
        players: (apiMatch.players || []).filter((p: any) => p.accepted).map(mapPlayerFromApi),
        invitedPlayerIds: [], // The current backend response doesn't provide this information.
        capacity: apiMatch.max_players,
        status: status,
        // The backend uses organizer_id, but some frontend components might expect bookedById
        bookedById: apiMatch.organizer_id ? apiMatch.organizer_id.toString() : undefined,
        notes: apiMatch.notes,
        organizer: apiMatch.organizer ? mapPlayerFromApi(apiMatch.organizer) : undefined,
    };
};

const mapTimeSlotRequestFromApi = (apiRequest: any): TimeSlotRequest => ({
    playerId: apiRequest.player_id.toString(),
    // The backend provides a full ISO string for the date part.
    date: new Date(apiRequest.preferred_date),
    // The backend provides time as "HH:mm:ss", frontend expects "HH:mm".
    time: apiRequest.preferred_start_time.substring(0, 5),
});

// Helper to handle API responses and errors
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return parseDates(data); // Recursively parse date strings into Date objects
};

// Helper to get authorization headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No auth token found. Please log in.');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Helper to recursively parse ISO date strings in API responses into Date objects
const parseDates = (data: any): any => {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(parseDates);

    const newObj: { [key: string]: any } = {};
    for (const key in data) {
        if (key === 'date' && typeof data[key] === 'string' && /^\d{4}-\d{2}-\d{2}/.test(data[key])) {
            // Adjust for timezone to avoid off-by-one day errors
            newObj[key] = new Date(data[key] + 'T00:00:00');
        } else if (typeof data[key] === 'object') {
            newObj[key] = parseDates(data[key]);
        } else {
            newObj[key] = data[key];
        }
    }
    return newObj;
};


export const courtService = {
    // --- Auth ---
    login: async (email: string, password: string): Promise<string> => {
        // Switched to 'application/x-www-form-urlencoded' to match standard FastAPI OAuth2 endpoints,
        // which resolves the 422 Unprocessable Entity error. The endpoint expects form data, not JSON.
        const formData = new URLSearchParams();
        formData.append('username', email); // The OAuth2 standard form field is 'username'.
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Login failed. Check credentials.' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // FastAPI's default OAuth2 response includes 'access_token'.
        const token = data.access_token;

        if (!token) {
            throw new Error('Login response from server was successful, but did not contain an access_token.');
        }

        return token;
    },

    getMe: async (): Promise<Player> => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getAuthHeaders(),
        });
        const rawData = await handleResponse(response);
        return mapPlayerFromApi(rawData);
    },
    
    // --- General Data ---
    fetchCourts: async (): Promise<Court[]> => {
        const response = await fetch(`${API_BASE_URL}/courts`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    fetchAllPlayers: async (): Promise<Player[]> => {
        const response = await fetch(`${API_BASE_URL}/players`, { headers: getAuthHeaders() });
        const rawData = await handleResponse(response);
        // Handle both direct array and wrapped object responses for robustness.
        const players = Array.isArray(rawData) ? rawData : rawData.players || [];
        return players.map(mapPlayerFromApi);
    },

    fetchOpeningHours: async (): Promise<OpeningHours> => {
        const response = await fetch(`${API_BASE_URL}/settings/opening-hours`, { headers: getAuthHeaders() });
        const rawData = await handleResponse(response);
        
        // This logic robustly unwraps the opening hours data.
        const hoursData = rawData.openingHours || rawData.opening_hours || rawData;

        // Ensure the final result is a valid object, defaulting to an empty one if the
        // API returns null, an array, or any other non-object type. This prevents crashes.
        if (typeof hoursData !== 'object' || hoursData === null || Array.isArray(hoursData)) {
            return {};
        }
        return hoursData;
    },

    updateOpeningHours: async (newHours: OpeningHours): Promise<OpeningHours> => {
        const response = await fetch(`${API_BASE_URL}/settings/opening-hours`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ openingHours: newHours }),
        });
        const rawData = await handleResponse(response);
        // The response after updating might also be wrapped. We unwrap it for consistency.
        return rawData.openingHours || rawData.opening_hours || rawData || {};
    },

    // --- Player-Specific Data ---
    fetchMyInvitations: async (): Promise<Match[]> => {
        const response = await fetch(`${API_BASE_URL}/me/invitations`, { headers: getAuthHeaders() });
        const rawData = await handleResponse(response);
        // Handle responses that might be a direct array or wrapped in an object
        // (e.g., {"invitations": [...]}, {"matches": [...]}, or just [...]).
        const invitations = rawData.invitations || rawData.matches || (Array.isArray(rawData) ? rawData : []);
        return invitations.map(mapMatchFromApi);
    },

    fetchMyMatches: async (): Promise<Match[]> => {
        const response = await fetch(`${API_BASE_URL}/me/matches`, { headers: getAuthHeaders() });
        const rawData = await handleResponse(response);
        // Handle both direct array and wrapped object responses for robustness.
        const matches = rawData.matches || (Array.isArray(rawData) ? rawData : []);
        return matches.map(mapMatchFromApi);
    },

    // --- Schedule & Matches ---
    fetchScheduleForDate: async (date: Date): Promise<{ matches: Match[], time_slot_requests: TimeSlotRequest[] }> => {
        const dateString = format(date, 'yyyy-MM-dd');
        // This endpoint was updated to align with the backend's /matches/schedule route.
        const response = await fetch(`${API_BASE_URL}/matches/schedule?date=${dateString}`, {
            headers: getAuthHeaders(),
        });
        const rawData = await handleResponse(response);
        return {
             matches: (rawData.matches || [])
                .filter((match: any) => match.status !== 'canceled')
                .map(mapMatchFromApi),
            time_slot_requests: (rawData.time_slot_requests || []).map(mapTimeSlotRequestFromApi),
        }
    },
    
    addTimeSlotRequest: async (date: Date, time: string): Promise<TimeSlotRequest> => {
      const response = await fetch(`${API_BASE_URL}/requests`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ date: format(date, 'yyyy-MM-dd'), time }),
      });
      const rawData = await handleResponse(response);
      return mapTimeSlotRequestFromApi(rawData);
    },

    createMatchAndInvite: async (slotInfo: SlotInfo, playerIdsToInvite: string[]): Promise<Match> => {
        const body = {
            court_id: slotInfo.courtId,
            date: format(slotInfo.date, 'yyyy-MM-dd'),
            time: slotInfo.time,
            player_ids_to_invite: playerIdsToInvite,
        };
        const response = await fetch(`${API_BASE_URL}/matches/create-and-invite`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        const rawData = await handleResponse(response);
        return mapMatchFromApi(rawData);
    },
    
    invitePlayersToMatch: async (matchId: string, playerIds: string[]): Promise<Match> => {
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}/invite`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ player_ids_to_invite: playerIds }),
        });
        const rawData = await handleResponse(response);
        return mapMatchFromApi(rawData);
    },
    
    respondToInvitation: async (matchId: string, response: 'ACCEPT' | 'DECLINE'): Promise<Match> => {
        const apiResponse = await fetch(`${API_BASE_URL}/matches/${matchId}/respond`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ response }),
        });
        const rawData = await handleResponse(apiResponse);
        return mapMatchFromApi(rawData);
    },

    bookCourt: async (courtId: string, date: Date, time: string): Promise<Match> => {
        const body = {
            court_id: courtId,
            date: format(date, 'yyyy-MM-dd'),
            time: time,
        };
        const response = await fetch(`${API_BASE_URL}/matches/book`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        const rawData = await handleResponse(response);
        return mapMatchFromApi(rawData);
    },
};