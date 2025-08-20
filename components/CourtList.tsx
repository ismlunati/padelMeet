import React from 'react';
import { Match, Player, Court, SlotInfo, TimeSlotRequest } from '../types';
import InvitationCard from './InvitationCard';
import MatchCard from './CourtCard';
import PlayerScheduleView from './PlayerScheduleView';

interface PlayerDashboardProps {
  matches: Match[];
  courts: Court[];
  currentUser: Player;
  timeSlotRequests: TimeSlotRequest[];
  onRespondToInvitation: (matchId: string, response: 'ACCEPT' | 'DECLINE') => void;
  onSlotClick: (slotInfo: SlotInfo) => void;
  isLoading: boolean;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ matches, courts, currentUser, timeSlotRequests, onRespondToInvitation, onSlotClick, isLoading }) => {
    
    const myInvitations = matches.filter(m => m.invitedPlayerIds.includes(currentUser.id) && m.status === 'ORGANIZING');
    const myConfirmedMatches = matches.filter(m => m.players.some(p => p.id === currentUser.id));

    if (isLoading) {
        return <div className="text-center text-slate-300">Cargando tu panel...</div>;
    }

    return (
        <div className="animate-fade-in space-y-16">
            <div>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white">Hola, {currentUser.name.split(' ')[0]}</h1>
                    <p className="text-lg text-slate-400 mt-2">Este es tu panel de partidos.</p>
                </div>

                {/* Invitations Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">Mis Invitaciones</h2>
                    {myInvitations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myInvitations.map((match) => (
                                <InvitationCard key={match.id} match={match} onRespond={onRespondToInvitation} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-brand-light-dark rounded-lg border border-brand-stroke">
                            <p className="text-slate-400">No tienes invitaciones pendientes.</p>
                        </div>
                    )}
                </div>
                
                {/* Confirmed Matches Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Mis Próximos Partidos</h2>
                    {myConfirmedMatches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myConfirmedMatches.map((match) => (
                               <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-brand-light-dark rounded-lg border border-brand-stroke">
                            <p className="text-slate-400">Aún no te has apuntado a ningún partido.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Player Schedule View for Booking/Requesting */}
            <div>
                 <h2 className="text-2xl font-bold text-white mb-4 text-center">Calendario de Pistas</h2>
                <PlayerScheduleView
                    matches={matches}
                    courts={courts}
                    currentUser={currentUser}
                    timeSlotRequests={timeSlotRequests}
                    onSlotClick={onSlotClick}
                />
            </div>
        </div>
    );
};

export default PlayerDashboard;