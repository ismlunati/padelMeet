export interface Player {
    id: string;
    name: string;
    avatarUrl: string;
    role: 'admin' | 'player';
    phoneNumber?: string; // Optional for WhatsApp integration
}

export interface Court {
  id: string;
  name: string;
  court_type?: string; // e.g., 'double', 'single', 'panoramic'
  indoor?: boolean;
}

export interface Match {
  id: string;
  court: Court;
  start_time: string; // From backend, e.g., "2025-08-20T18:00:00Z"
  end_time: string;   // From backend
  players: Player[]; // Confirmed players
  invitedPlayerIds: string[]; // IDs of players who have been invited
  capacity: number;
  status: 'ORGANIZING' | 'CONFIRMED' | 'BOOKED';
  bookedById?: string; // Player ID who booked the full court
  notes?: string; // Notes for the match
  organizer?: Player; // The player who organized the match
}

// Represents a player's interest in a specific time slot on a specific day
export interface TimeSlotRequest {
  playerId: string;
  date: Date;
  time: string;
}

export interface SlotInfo {
  courtId: string;
  courtName: string;
  time: string;
  date: Date;
}


export enum ViewState {
  // Although we removed clubs, we can repurpose this for the default match list view
  LIST_CLUBS = 'LIST_CLUBS', 
  // Other views can be added later if needed
}

export interface OpeningHours {
  // Key is the day of the week (0 for Sunday, 1 for Monday, etc.)
  [dayOfWeek: number]: string[]; 
}