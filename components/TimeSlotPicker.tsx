import React, { useState } from 'react';
import { Court, Match, Player, TimeSlotRequest, SlotInfo } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { UsersIcon } from './IconComponents';

interface AdminDashboardProps {
  matches: Match[];
  courts: Court[];
  players: Player[];
  timeSlotRequests: TimeSlotRequest[];
  onOpenInviteModal: (context: { match?: Match, slotInfo?: SlotInfo }) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ matches, courts, players, timeSlotRequests, onOpenInviteModal }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const slotTimes = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"];

  const getPlayerName = (playerId: string) => players.find(p => p.id === playerId)?.name || 'Jugador desconocido';

  return (
    <div className="bg-brand-light-dark p-4 sm:p-6 rounded-xl border border-brand-stroke shadow-2xl animate-slide-in-up">
      <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Cuaderno del Administrador</h2>
          <p className="text-slate-400">
            Gestionando partidos para el {format(currentDate, "eeee, d 'de' MMMM", { locale: es })}
          </p>
      </div>

      <div className="overflow-x-auto">
        <div className="grid gap-px bg-brand-stroke border border-brand-stroke" style={{ gridTemplateColumns: `minmax(8rem, auto) repeat(${courts.length}, 1fr)` }}>
          {/* Header Row: Apply height and correct z-index */}
          <div className="bg-brand-dark p-3 text-center font-bold sticky top-[69px] left-0 z-30 h-20 flex items-center justify-center">Hora</div>
          {courts.map(court => (
            <div key={court.id} className="bg-brand-dark p-3 text-center font-bold text-white break-words sticky top-[69px] z-20 h-20 flex items-center justify-center">
              {court.name}
            </div>
          ))}
          
          {/* Body Rows */}
          {slotTimes.map(time => {
            const interestedPlayersCount = timeSlotRequests.filter(
                req => req.time === time && format(req.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
            ).length;

            return (
                <React.Fragment key={time}>
                  <div className="bg-brand-dark p-3 text-center font-bold text-slate-300 flex items-center justify-center gap-x-4 sticky left-0 z-10 h-20">
                      <div>
                        <span>{time}</span>
                        {interestedPlayersCount > 0 && (
                            <div className="flex items-center justify-center gap-1 bg-cyan-900/60 text-cyan-300 px-2 py-1 rounded-full text-xs mt-1" title={`${interestedPlayersCount} jugadores interesados`}>
                                <UsersIcon className="w-4 h-4" />
                                <span className="font-bold">{interestedPlayersCount}</span>
                            </div>
                        )}
                      </div>
                  </div>
                  {courts.map(court => {
                    const matchOnSlot = matches.find(m => 
                        m.court.id === court.id && 
                        m.time === time &&
                        format(m.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
                    );

                    if (matchOnSlot) {
                        switch (matchOnSlot.status) {
                            case 'ORGANIZING':
                                return (
                                    <div key={court.id} className="bg-yellow-900/40 p-2 text-center text-sm flex flex-col justify-center items-center h-20">
                                        <p className="font-bold text-yellow-300">Organizando...</p>
                                        <p className="text-xs text-yellow-400 mb-2">{matchOnSlot.players.length} / 4 confirmados</p>
                                        <button
                                            onClick={() => onOpenInviteModal({ match: matchOnSlot })}
                                            className="bg-yellow-500 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-yellow-600 transition-colors"
                                        >
                                            Invitar Jugadores
                                        </button>
                                    </div>
                                );
                            case 'CONFIRMED':
                                 return (
                                    <div key={court.id} className="bg-green-900/40 p-2 text-center text-sm flex flex-col justify-center items-center h-20">
                                        <p className="font-bold text-green-300">Partido Confirmado</p>
                                        <p className="text-xs text-green-400">{matchOnSlot.players.length} / 4 jugadores</p>
                                    </div>
                                );
                            case 'BOOKED':
                                 return (
                                    <div key={court.id} className="bg-blue-900/60 p-2 text-center text-sm flex flex-col justify-center items-center h-20">
                                        <p className="font-bold text-blue-300">Pista Reservada</p>
                                        <p className="text-xs text-blue-400">por {getPlayerName(matchOnSlot.bookedById!)}</p>
                                    </div>
                                );
                            default:
                                return <div key={court.id} className="bg-brand-light-dark p-2 h-20"></div>;
                        }
                    }
                    
                    const slotInfo: SlotInfo = { courtId: court.id, courtName: court.name, time, date: currentDate };
                    return (
                      <div key={court.id} className="bg-brand-light-dark p-2 text-center text-sm flex items-center justify-center h-20">
                        <button 
                          onClick={() => onOpenInviteModal({ slotInfo })}
                          className="w-full h-full bg-brand-stroke text-slate-300 rounded-md hover:bg-brand-primary hover:text-brand-dark font-semibold transition-colors"
                        >
                          Montar Partido
                        </button>
                      </div>
                    )
                  })}
                </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;