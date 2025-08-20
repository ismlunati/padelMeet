import React, { useState, useEffect, useCallback } from 'react';
import { Match, Player, Court, SlotInfo, OpeningHours } from '../types';
import { courtService } from '../services/courtService';
import InvitationCard from './InvitationCard';
import MatchCard from './CourtCard';
import PlayerScheduleView from './PlayerScheduleView';

interface PlayerDashboardProps {
  courts: Court[];
  currentUser: Player;
  openingHours: OpeningHours;
  onSlotClick: (slotInfo: SlotInfo) => void;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ courts, currentUser, openingHours, onSlotClick }) => {
    const [myInvitations, setMyInvitations] = useState<Match[]>([]);
    const [myConfirmedMatches, setMyConfirmedMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        if (!currentUser?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const [invitations, confirmedMatches] = await Promise.all([
                courtService.fetchMyInvitations(),
                courtService.fetchMyMatches(),
            ]);
            
            setMyInvitations(invitations);
            setMyConfirmedMatches(confirmedMatches);
        } catch (error) {
            console.error("Failed to fetch player dashboard data:", error);
            setError("No se pudieron cargar tus partidos. Es posible que el servidor tenga un problema. Por favor, contacta al administrador.");
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleRespondToInvitation = async (matchId: string, response: 'ACCEPT' | 'DECLINE') => {
        try {
            await courtService.respondToInvitation(matchId, response);
            fetchDashboardData(); // Refresh data after responding
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (isLoading) {
        return <div className="text-center text-slate-300">Cargando tu panel...</div>;
    }

    return (
        <div className="animate-fade-in space-y-16">
            <div>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white">Hola, {currentUser.name?.split(' ')[0] ?? ''}</h1>
                    <p className="text-lg text-slate-400 mt-2">Este es tu panel de partidos.</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-center mb-10">
                        <p className="font-bold">Error de Conexión</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {!error && (
                    <>
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white mb-4">Mis Invitaciones</h2>
                            {myInvitations.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myInvitations.map((match) => (
                                        <InvitationCard key={match.id} match={match} onRespond={handleRespondToInvitation} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-brand-light-dark rounded-lg border border-brand-stroke">
                                    <p className="text-slate-400">No tienes invitaciones pendientes.</p>
                                </div>
                            )}
                        </div>
                        
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
                    </>
                )}
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-white mb-4 text-center">Calendario de Pistas</h2>
                <PlayerScheduleView
                    courts={courts}
                    currentUser={currentUser}
                    openingHours={openingHours}
                    onSlotClick={onSlotClick}
                />
            </div>
        </div>
    );
};

export default PlayerDashboard;