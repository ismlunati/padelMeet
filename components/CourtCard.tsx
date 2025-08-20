import React from 'react';
import { Match } from '../types';
import { UsersIcon, TennisRacketIcon } from './IconComponents';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { court, players, capacity, start_time } = match;
  
  // Defensively create date objects to prevent crashes if start_time is missing.
  const matchDate = start_time ? new Date(start_time) : null;
  const displayTime = matchDate ? format(matchDate, 'HH:mm') : 'Hora inválida';
  const displayDate = matchDate ? format(matchDate, "eeee d", { locale: es }) : 'Fecha inválida';

  return (
    <div className="bg-brand-light-dark rounded-xl shadow-lg border border-brand-stroke flex flex-col p-5 animate-slide-in-up">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-2xl font-bold text-white">{displayTime}</p>
                 <p className="text-sm font-semibold text-slate-300 capitalize">{displayDate}</p>
                <div className="flex items-center text-sm text-slate-400 mt-1">
                    <TennisRacketIcon className="w-4 h-4 mr-2"/>
                    {court.name}
                </div>
            </div>
            <div className={`text-right ${match.status === 'CONFIRMED' ? 'text-green-400' : 'text-yellow-400'}`}>
                <div className="flex items-center justify-end font-semibold">
                    <UsersIcon className="w-5 h-5 mr-1.5" />
                    <span>{players.length}/{capacity}</span>
                </div>
                <p className="text-sm">{match.status === 'CONFIRMED' ? 'Confirmado' : 'Organizando'}</p>
            </div>
        </div>

        <div>
            <p className="font-semibold text-white mb-2">Jugadores:</p>
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
             {players.length === 0 && <p className="text-sm text-slate-500">Aún no hay jugadores confirmados.</p>}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;