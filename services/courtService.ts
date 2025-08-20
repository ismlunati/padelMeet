import { Court, Match, Player, TimeSlotRequest, SlotInfo } from '../types';
import { format } from 'date-fns';

// Simplified static data for a single club
const courts: Court[] = [
  { id: '1', name: 'Pista Central' },
  { id: '2', name: 'Pista 2' },
  { id: '3', name: 'Pista 3' },
];

const allPlayers: Player[] = [
    { id: 'p1', name: 'Club Admin', avatarUrl: 'https://i.pravatar.cc/150?u=admin', role: 'admin' },
    { id: 'p2', name: 'Maria Sharapova', avatarUrl: 'https://i.pravatar.cc/150?u=maria', role: 'player' },
    { id: 'p3', name: 'Carlos Alcaraz', avatarUrl: 'https://i.pravatar.cc/150?u=carlos', role: 'player' },
    { id: 'p4', name: 'Laura Martinez', avatarUrl: 'https://i.pravatar.cc/150?u=laura', role: 'player' },
    { id: 'p5', name: 'David Ferrer', avatarUrl: 'https://i.pravatar.cc/150?u=david', role: 'player' },
    { id: 'p6', name: 'Sofia Kenin', avatarUrl: 'https://i.pravatar.cc/150?u=sofia', role: 'player' },
    { id: 'p7', name: 'Rafael Nadal', avatarUrl: 'https://i.pravatar.cc/150?u=rafa', role: 'player' },
    { id: 'p8', name: 'Serena Williams', avatarUrl: 'https://i.pravatar.cc/150?u=serena', role: 'player' },
];

// In-memory "database" of matches
let matches: Match[] = [
    {
        id: 'm1',
        court: courts[0],
        date: new Date(),
        time: '18:00',
        players: [allPlayers[1], allPlayers[2], allPlayers[3], allPlayers[4]],
        invitedPlayerIds: [],
        capacity: 4,
        status: 'CONFIRMED',
    },
    {
        id: 'm2',
        court: courts[1],
        date: new Date(),
        time: '19:30',
        players: [allPlayers[0]],
        invitedPlayerIds: [allPlayers[6].id, allPlayers[7].id],
        capacity: 4,
        status: 'ORGANIZING',
    },
    {
        id: 'm4',
        court: courts[0],
        date: new Date(),
        time: '10:30',
        players: [],
        invitedPlayerIds: [],
        capacity: 4,
        status: 'BOOKED',
        bookedById: allPlayers[5].id,
    }
];

let timeSlotRequests: TimeSlotRequest[] = [
    { playerId: allPlayers[2].id, date: new Date(), time: '21:00' },
    { playerId: allPlayers[4].id, date: new Date(), time: '21:00' },
];

export const courtService = {
  fetchCourts: (): Promise<Court[]> => {
    return new Promise(resolve => resolve(courts));
  },
  
  fetchAllPlayers: (): Promise<Player[]> => {
      return new Promise(resolve => resolve(allPlayers));
  },

  fetchAllMatches: (): Promise<Match[]> => {
      return new Promise(resolve => setTimeout(() => resolve([...matches]), 300));
  },
  
  fetchTimeSlotRequests: (): Promise<TimeSlotRequest[]> => {
      return new Promise(resolve => setTimeout(() => resolve([...timeSlotRequests]), 100));
  },

  addTimeSlotRequest: (playerId: string, date: Date, time: string): Promise<TimeSlotRequest> => {
      return new Promise((resolve, reject) => {
          const alreadyRequested = timeSlotRequests.some(
              req => req.playerId === playerId && req.time === time && format(req.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );
          if (alreadyRequested) {
              // Optionally, you could reject or just resolve without adding.
              // For a good UX, we'll just ignore the duplicate request.
              const existing = timeSlotRequests.find(req => req.playerId === playerId && req.time === time)!;
              return resolve(existing);
          }
          const newRequest: TimeSlotRequest = { playerId, date, time };
          timeSlotRequests.push(newRequest);
          resolve(newRequest);
      });
  },

  createMatchAndInvite: (slotInfo: SlotInfo, admin: Player, playerIdsToInvite: string[]): Promise<Match> => {
      return new Promise((resolve, reject) => {
          const court = courts.find(c => c.id === slotInfo.courtId);
          if (!court) return reject(new Error("Court not found"));

          const newMatch: Match = {
              id: `m${Date.now()}`,
              court,
              date: slotInfo.date,
              time: slotInfo.time,
              players: [admin],
              invitedPlayerIds: playerIdsToInvite,
              capacity: 4,
              status: 'ORGANIZING'
          };
          matches.push(newMatch);
          // When a match is created, remove the requests for that time slot
          timeSlotRequests = timeSlotRequests.filter(req => req.time !== slotInfo.time || format(req.date, 'yyyy-MM-dd') !== format(slotInfo.date, 'yyyy-MM-dd'));
          resolve(newMatch);
      });
  },

  invitePlayersToMatch: (matchId: string, playerIds: string[]): Promise<Match> => {
      return new Promise((resolve, reject) => {
          const matchIndex = matches.findIndex(m => m.id === matchId);
          if (matchIndex === -1) return reject(new Error("Match not found"));
          
          const existingInvites = matches[matchIndex].invitedPlayerIds;
          const newInvites = playerIds.filter(id => !existingInvites.includes(id));
          matches[matchIndex].invitedPlayerIds.push(...newInvites);

          resolve(matches[matchIndex]);
      });
  },
  
  respondToInvitation: (matchId: string, playerId: string, response: 'ACCEPT' | 'DECLINE'): Promise<Match> => {
      return new Promise((resolve, reject) => {
          const matchIndex = matches.findIndex(m => m.id === matchId);
          if (matchIndex === -1) return reject(new Error("Match not found"));
          
          const match = matches[matchIndex];
          
          match.invitedPlayerIds = match.invitedPlayerIds.filter(id => id !== playerId);

          if (response === 'ACCEPT') {
              if (match.players.length >= match.capacity) {
                  return reject(new Error("Lo sentimos, ¡el partido ya está completo!"));
              }
              const player = allPlayers.find(p => p.id === playerId);
              if (player && !match.players.some(p => p.id === playerId)) {
                  match.players.push(player);
              }
              if (match.players.length === match.capacity) {
                  match.status = 'CONFIRMED';
                  match.invitedPlayerIds = [];
              }
          }
          
          matches[matchIndex] = match;
          resolve(match);
      });
  },

  bookCourt: (courtId: string, date: Date, time: string, player: Player): Promise<Match> => {
    return new Promise((resolve, reject) => {
        const court = courts.find(c => c.id === courtId);
        if (!court) return reject(new Error("Court not found"));

        const newBooking: Match = {
            id: `m${Date.now()}`, court, date, time,
            players: [], invitedPlayerIds: [], capacity: 4, status: 'BOOKED',
            bookedById: player.id
        };
        matches.push(newBooking);
        resolve(newBooking);
    });
  },
};