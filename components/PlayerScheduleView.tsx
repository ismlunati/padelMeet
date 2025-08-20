import React, { useState, useEffect, useCallback } from 'react';
import { Court, Match, SlotInfo, Player, TimeSlotRequest, OpeningHours } from '../types';
import { format, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import DateNavigator from './DateSelector';
import { courtService } from '../services/courtService';

interface PlayerScheduleViewProps {
  courts: Court[];
  currentUser: Player;
  openingHours: OpeningHours;
  onSlotClick: (slotInfo: SlotInfo) => void;
}

const PlayerScheduleView: React.FC<PlayerScheduleViewProps> = ({ courts, currentUser, openingHours, onSlotClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [timeSlotRequests, setTimeSlotRequests] = useState<TimeSlotRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dayOfWeek = getDay(currentDate);
  const slotTimes = openingHours[dayOfWeek] || [];

  const fetchSchedule = useCallback(async (date: Date) => {
    setIsLoading(true);
    try {
        const { matches, time_slot_requests } = await courtService.fetchScheduleForDate(date);
        setMatches(matches);
        setTimeSlotRequests(time_slot_requests);
    } catch (error) {
        console.error(`Failed to fetch schedule for ${date}:`, error);
        setMatches([]);
        setTimeSlotRequests([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(currentDate);
  }, [currentDate, fetchSchedule]);

  const handleSlotClick = (court: Court, time: string) => {
    onSlotClick({ courtId: court.id, courtName: court.name, time: time, date: currentDate });
    // Refetch after modal interaction might change state
    setTimeout(() => fetchSchedule(currentDate), 500);
  };
  
  const getStatusClass = (status: Match['status']) => {
      switch (status) {
          case 'ORGANIZING': return 'bg-yellow-900/40 text-yellow-300';
          case 'CONFIRMED': return 'bg-green-900/40 text-green-300';
          case 'BOOKED': return 'bg-blue-900/60 text-blue-300';
          default: return 'bg-brand-light-dark';
      }
  };
  
  const getStatusText = (status: Match['status']) => {
     switch (status) {
          case 'ORGANIZING': return 'Organizando';
          case 'CONFIRMED': return 'Confirmado';
          case 'BOOKED': return 'Reservado';
          default: return '';
      }
  }

  return (
    <div className="bg-brand-light-dark p-4 sm:p-6 rounded-xl border border-brand-stroke shadow-2xl">
      <DateNavigator currentDate={currentDate} onDateChange={setCurrentDate} />

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">Cargando disponibilidad...</div>
        ) : slotTimes.length > 0 ? (
            <div className="grid gap-px bg-brand-stroke border border-brand-stroke" style={{ gridTemplateColumns: `minmax(6rem, auto) repeat(${courts.length}, 1fr)` }}>
              {/* Header Row */}
              <div className="bg-brand-dark p-3 text-center font-bold">Hora</div>
              {courts.map(court => (
                <div key={court.id} className="bg-brand-dark p-3 text-center font-bold text-white break-words">
                  {court.name}
                </div>
              ))}
              
              {/* Body Rows */}
              {slotTimes.map(time => {
                const hasUserRequestedThisSlot = timeSlotRequests.some(req => req.playerId === currentUser.id && req.time === time);
                
                return (
                  <React.Fragment key={time}>
                    <div className={`p-3 text-center font-bold ${hasUserRequestedThisSlot ? 'bg-teal-900/50 text-teal-300' : 'bg-brand-dark text-slate-300'}`}>
                        {time}
                        {hasUserRequestedThisSlot && <span className="block text-xs font-normal opacity-80">(Apuntado)</span>}
                    </div>
                    {courts.map(court => {
                      const matchOnSlot = matches.find(m => m.court.id === court.id && m.time === time);

                      if (matchOnSlot) {
                          return (
                              <div key={court.id} className={`p-2 text-center text-sm flex flex-col justify-center items-center ${getStatusClass(matchOnSlot.status)}`}>
                                  <p className="font-bold">{getStatusText(matchOnSlot.status)}</p>
                                  {(matchOnSlot.status === 'ORGANIZING' || matchOnSlot.status === 'CONFIRMED') &&
                                      <p className="text-xs opacity-80">{matchOnSlot.players.length} / 4 Jugadores</p>
                                  }
                              </div>
                          )
                      }
                      
                      return (
                        <div key={court.id} className={`p-2 text-center text-sm flex items-center justify-center ${hasUserRequestedThisSlot ? 'bg-teal-900/20' : 'bg-brand-light-dark'}`}>
                          <button 
                            onClick={() => handleSlotClick(court, time)}
                            className="w-full h-full bg-brand-stroke text-slate-300 rounded-md hover:bg-brand-primary hover:text-brand-dark font-semibold transition-colors"
                          >
                            Elegir
                          </button>
                        </div>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </div>
        ) : (
             <div className="text-center py-10 bg-brand-dark rounded-lg border border-dashed border-brand-stroke">
                <p className="text-slate-400">No hay pistas disponibles en este día.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PlayerScheduleView;
