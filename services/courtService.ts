import { Court, Match, Player, TimeSlotRequest, SlotInfo, OpeningHours } from '../types';
import { format } from 'date-fns';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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
        return handleResponse(response);
    },
    
    // --- General Data ---
    fetchCourts: async (): Promise<Court[]> => {
        const response = await fetch(`${API_BASE_URL}/courts`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    fetchAllPlayers: async (): Promise<Player[]> => {
        const response = await fetch(`${API_BASE_URL}/players`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    fetchOpeningHours: async (): Promise<OpeningHours> => {
        const response = await fetch(`${API_BASE_URL}/settings/opening-hours`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    updateOpeningHours: async (newHours: OpeningHours): Promise<OpeningHours> => {
        const response = await fetch(`${API_BASE_URL}/settings/opening-hours`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ openingHours: newHours }),
        });
        return handleResponse(response);
    },

    // --- Player-Specific Data ---
    fetchMyInvitations: async (): Promise<Match[]> => {
        const response = await fetch(`${API_BASE_URL}/me/invitations`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    fetchMyMatches: async (): Promise<Match[]> => {
        const response = await fetch(`${API_BASE_URL}/me/matches`, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    // --- Schedule & Matches ---
    fetchScheduleForDate: async (date: Date): Promise<{ matches: Match[], time_slot_requests: TimeSlotRequest[] }> => {
        const dateString = format(date, 'yyyy-MM-dd');
        // This is the corrected line. It now correctly points to /schedule.
        const response = await fetch(`${API_BASE_URL}/schedule?date=${dateString}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },
    
    addTimeSlotRequest: async (date: Date, time: string): Promise<TimeSlotRequest> => {
      return fetch(`${API_BASE_URL}/requests`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ date: format(date, 'yyyy-MM-dd'), time }),
      }).then(handleResponse);
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
        return handleResponse(response);
    },
    
    invitePlayersToMatch: async (matchId: string, playerIds: string[]): Promise<Match> => {
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}/invite`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ player_ids_to_invite: playerIds }),
        });
        return handleResponse(response);
    },
    
    respondToInvitation: async (matchId: string, response: 'ACCEPT' | 'DECLINE'): Promise<Match> => {
        const apiResponse = await fetch(`${API_BASE_URL}/matches/${matchId}/respond`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ response }),
        });
        return handleResponse(apiResponse);
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
        return handleResponse(response);
    },
};