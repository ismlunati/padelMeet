import React, { useState, useMemo } from 'react';
import { Match, Player, SlotInfo } from '../types';
import { format } from 'date-fns';

interface InvitationModalProps {
    match: Match | null;
    slotInfo: SlotInfo | null;
    allPlayers: Player[];
    onClose: () => void;
    onSubmit: (playerIds: string[]) => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({ match, slotInfo, allPlayers, onClose, onSubmit }) => {
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const contextTime = match && match.start_time ? format(new Date(match.start_time), 'HH:mm') : slotInfo?.time;

    const filteredPlayers = useMemo(() => {
        const alreadyInMatchOrInvited = new Set(match ? [...match.players.map(p => p.id), ...match.invitedPlayerIds] : []);
        
        return allPlayers
            .filter(p => !alreadyInMatchOrInvited.has(p.id))
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
            
    }, [allPlayers, match, searchTerm]);

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
                    
                    <div className="space-y-3">
                        {filteredPlayers.length > 0 ? (
                            filteredPlayers.map(player => <PlayerRow key={player.id} player={player} />)
                        ) : (
                            <p className="text-slate-400 text-center py-4">No hay jugadores disponibles para invitar.</p>
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