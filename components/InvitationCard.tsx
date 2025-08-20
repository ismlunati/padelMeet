import React from 'react';
import { Match } from '../types';
import { UsersIcon, TennisRacketIcon } from './IconComponents';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';


interface InvitationCardProps {
  match: Match;
  onRespond: (matchId: string, response: 'ACCEPT' | 'DECLINE') => void;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ match, onRespond }) => {
  const { id, court, time, players, capacity, date } = match;

  return (
    <div className="bg-brand-light-dark rounded-xl shadow-lg border-2 border-dashed border-yellow-500/50 flex flex-col p-5 animate-slide-in-up">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-2xl font-bold text-white">{time}</p>
                <p className="text-sm font-semibold text-slate-300 capitalize">{format(date, "eeee d", { locale: es })}</p>
                <div className="flex items-center text-sm text-slate-400 mt-1">
                    <TennisRacketIcon className="w-4 h-4 mr-2"/>
                    {court.name}
                </div>
            </div>
            <div className="text-right text-yellow-400">
                <div className="flex items-center justify-end font-semibold">
                    <UsersIcon className="w-5 h-5 mr-1.5" />
                    <span>{players.length}/{capacity}</span>
                </div>
                <p className="text-sm">Plazas Ocupadas</p>
            </div>
        </div>

        <div className="mb-6">
            <p className="font-semibold text-white mb-2">Confirmados:</p>
            {players.length > 0 ? (
                <div className="flex flex-wrap -space-x-2">
                    {players.map(player => (
                        <img
                            key={player.id}
                            className="w-10 h-10 rounded-full border-2 border-brand-dark"
                            src={player.avatarUrl}
                            alt={player.name}
                            title={player.name}
                        />
                    ))}
                </div>
            ) : <p className="text-sm text-slate-500">Aún no hay nadie confirmado.</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
            onClick={() => onRespond(id, 'DECLINE')}
            className="w-full bg-red-900/50 text-red-300 border border-red-500/50 font-bold py-3 px-4 rounded-lg transition-colors hover:bg-red-800/60"
        >
            Rechazar
        </button>
        <button
            onClick={() => onRespond(id, 'ACCEPT')}
            className="w-full bg-green-800/50 text-green-300 border border-green-500/50 font-bold py-3 px-4 rounded-lg transition-colors hover:bg-green-700/60"
        >
            Aceptar
        </button>
      </div>
    </div>
  );
};

export default InvitationCard;