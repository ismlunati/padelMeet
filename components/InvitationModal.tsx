import React, { useState, useMemo } from 'react';
import { Match, Player, SlotInfo, TimeSlotRequest } from '../types';
import { format } from 'date-fns';

interface InvitationModalProps {
    match: Match | null;
    slotInfo: SlotInfo | null;
    allPlayers: Player[];
    timeSlotRequests: TimeSlotRequest[];
    onClose: () => void;
    onSubmit: (playerIds: string[]) => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({ match, slotInfo, allPlayers, timeSlotRequests, onClose, onSubmit }) => {
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const contextTime = match?.time || slotInfo?.time;
    const contextDate = match?.date || slotInfo?.date;

    const { interestedPlayers, otherPlayers } = useMemo(() => {
        const alreadyInMatchOrInvited = new Set(match ? [...match.players.map(p => p.id), ...match.invitedPlayerIds] : []);
        
        const interestedPlayerIds = new Set(
            timeSlotRequests
                .filter(req => req.time === contextTime && format(req.date, 'yyyy-MM-dd') === format(contextDate!, 'yyyy-MM-dd'))
                .map(req => req.playerId)
        );

        const filteredPlayers = allPlayers
            .filter(p => !alreadyInMatchOrInvited.has(p.id))
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const interested = filteredPlayers.filter(p => interestedPlayerIds.has(p.id));
        const others = filteredPlayers.filter(p => !interestedPlayerIds.has(p.id));

        return { interestedPlayers: interested, otherPlayers: others };
    }, [allPlayers, match, timeSlotRequests, contextTime, contextDate, searchTerm]);

    const handlePlayerToggle = (playerId: string) => {
        setSelectedPlayerIds(prev =>
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [...prev, playerId]
        );
    };

    const handleSubmit = () => {
        onSubmit(selectedPlayerIds);
    };

    const PlayerRow = ({ player }: { player: Player }) => (
        <div
            onClick={() => handlePlayerToggle(player.id)}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedPlayerIds.includes(player.id) ? 'bg-brand-primary/20 ring-2 ring-brand-primary' : 'bg-brand-stroke hover:bg-slate-700'}`}
        >
            <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full mr-4" />
            <span className="font-semibold text-white">{player.name}</span>
            <div className={`ml-auto w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedPlayerIds.includes(player.id) ? 'bg-brand-primary border-brand-primary' : 'border-slate-500'}`}>
               {selectedPlayerIds.includes(player.id) && <span className="text-brand-dark font-bold">✓</span>}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-brand-light-dark w-full max-w-md rounded-2xl shadow-2xl border border-brand-stroke flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-brand-stroke">
                    <h2 className="text-2xl font-bold text-white">{match ? 'Invitar Jugadores' : 'Crear Partido e Invitar'}</h2>
                    <p className="text-slate-400">
                        Pista {match?.court.name || slotInfo?.courtName} a las {contextTime}
                    </p>
                </div>

                <div className="p-6 flex-grow overflow-y-auto max-h-[60vh]">
                    <input
                        type="text"
                        placeholder="Buscar jugador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-brand-dark border border-brand-stroke rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    
                    <div className="space-y-4">
                        {interestedPlayers.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-cyan-400 mb-2">JUGADORES INTERESADOS</h3>
                                <div className="space-y-3">
                                    {interestedPlayers.map(player => <PlayerRow key={player.id} player={player} />)}
                                </div>
                            </div>
                        )}
                        
                        {otherPlayers.length > 0 && (
                             <div>
                                <h3 className="text-sm font-bold text-slate-400 mb-2">OTROS JUGADORES</h3>
                                <div className="space-y-3">
                                    {otherPlayers.map(player => <PlayerRow key={player.id} player={player} />)}
                                </div>
                            </div>
                        )}

                        {interestedPlayers.length === 0 && otherPlayers.length === 0 && (
                            <p className="text-slate-400 text-center py-4">No hay jugadores disponibles.</p>
                        )}
                    </div>
                </div>
                
                <div className="p-6 border-t border-brand-stroke flex justify-end gap-4">
                    <button onClick={onClose} className="bg-brand-stroke text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-700 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={selectedPlayerIds.length === 0}
                        className="bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-dark font-bold py-2 px-5 rounded-lg disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        {match ? 'Enviar Invitaciones' : 'Crear y Enviar'} {selectedPlayerIds.length > 0 ? `(${selectedPlayerIds.length})` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvitationModal;