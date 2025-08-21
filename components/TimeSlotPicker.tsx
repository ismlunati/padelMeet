import React, { useState, useEffect, useCallback } from 'react';
import { Court, Match, Player, TimeSlotRequest, SlotInfo, OpeningHours } from '../types';
import { format, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { UsersIcon, CogIcon } from './IconComponents';
import DateNavigator from './DateSelector';
import { courtService } from '../services/courtService';

interface AdminDashboardProps {
  courts: Court[];
  players: Player[];
  openingHours: OpeningHours;
  onOpenInviteModal: (context: { match?: Match, slotInfo?: SlotInfo }) => void;
  onOpenHoursModal: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ courts, players, openingHours, onOpenInviteModal, onOpenHoursModal }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState<Match[]>([]);
  const [timeSlotRequests, setTimeSlotRequests] = useState<TimeSlotRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const dayOfWeek = getDay(currentDate);
  const slotTimes = openingHours[dayOfWeek] || [];

  const fetchSchedule = useCallback(async (date: Date) => {
      setIsLoading(true);
      setError(null);
      try {
          const { matches, time_slot_requests } = await courtService.fetchScheduleForDate(date);
          setMatches(matches);
          setTimeSlotRequests(time_slot_requests);
      } catch (error) {
          console.error(`Failed to fetch schedule for ${date}:`, error);
          setError("No se pudo cargar el calendario. Verifica que el endpoint '/schedule' esté funcionando correctamente en el backend.");
          setMatches([]);
          setTimeSlotRequests([]);
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchSchedule(currentDate);
  }, [currentDate, fetchSchedule]);

  const getPlayerName = (playerId: string) => players.find(p => p.id === playerId)?.name || 'Jugador desconocido';
  
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleAction = (context: { match?: Match, slotInfo?: SlotInfo }) => {
    onOpenInviteModal(context);
    // After modal closes, we want to refresh the data for the current day
    // This is handled by a callback from App.tsx or we could refetch here.
    // For simplicity, we can just refetch.
    setTimeout(() => fetchSchedule(currentDate), 500); // Small delay to allow optimistic updates
  };
  
  const renderGrid = () => {
    if (isLoading) {
      return <div className="text-center py-10 text-slate-400">Cargando calendario...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10 bg-red-900/20 rounded-lg border border-dashed border-red-500/50">
                <p className="font-bold text-red-300">Error de Carga</p>
                <p className="text-slate-400">{error}</p>
            </div>
        );
    }
    
    // The calendar grid cannot be drawn without opening hours. This message is more specific.
    if (!openingHours || Object.keys(openingHours).length === 0) {
        return (
            <div className="text-center py-10 bg-brand-dark rounded-lg border border-dashed border-brand-stroke">
                <p className="font-bold text-slate-300">Horarios no Configurados</p>
                <p className="text-sm text-slate-500 mt-2">No se han definido los horarios de apertura del club. Haz click en el icono de ajustes para configurarlos.</p>
            </div>
        );
    }

    if (slotTimes.length === 0) {
        return (
             <div className="text-center py-10 bg-brand-dark rounded-lg border border-dashed border-brand-stroke">
                <p className="text-slate-400">El club está cerrado este día.</p>
                <p className="text-sm text-slate-500 mt-2">Puedes cambiar los horarios de apertura en la configuración.</p>
            </div>
        );
    }
    
    return (
        <div className="grid gap-px bg-brand-stroke border border-brand-stroke" style={{ gridTemplateColumns: `minmax(8rem, auto) repeat(${courts.length}, 1fr)` }}>
          {/* Header Row */}
          <div className="bg-brand-dark p-3 text-center font-bold sticky top-[69px] left-0 z-30 h-20 flex items-center justify-center">Hora</div>
          {courts.map(court => (
            <div key={court.id} className="bg-brand-dark p-3 text-center font-bold text-white break-words sticky top-[69px] z-20 h-20 flex items-center justify-center">
              {court.name}
            </div>
          ))}
          
          {/* Body Rows */}
          {slotTimes.map(time => {
            const interestedPlayersCount = timeSlotRequests.filter(req => req.time === time).length;
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
                        m.court.id === court.id && m.start_time && m.start_time.substring(11, 16) === time
                    );

                    if (matchOnSlot) {
                        switch (matchOnSlot.status) {
                            case 'ORGANIZING':
                                return (
                                    <div key={court.id} className="bg-yellow-900/40 p-2 text-center text-sm flex flex-col justify-center items-center h-20">
                                        <p className="font-bold text-yellow-300">Organizando...</p>
                                        <p className="text-xs text-yellow-400 mb-2">{matchOnSlot.players.length} / 4 confirmados</p>
                                        <button
                                            onClick={() => handleAction({ match: matchOnSlot })}
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
                          onClick={() => handleAction({ slotInfo })}
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
    );
  };

  return (
    <div className="bg-brand-light-dark p-4 sm:p-6 rounded-xl border border-brand-stroke shadow-2xl animate-slide-in-up">
      <div className="flex justify-center items-center relative mb-2">
        <h2 className="text-3xl font-bold text-white text-center">Cuaderno del Administrador</h2>
        <button 
            onClick={onOpenHoursModal}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brand-stroke transition-colors"
            aria-label="Configurar horarios"
            title="Configurar horarios"
        >
            <CogIcon className="w-6 h-6 text-slate-300" />
        </button>
      </div>

      <DateNavigator currentDate={currentDate} onDateChange={handleDateChange} />
      
      {/* Explicitly check if courts are configured before attempting to render the schedule */}
      {courts.length === 0 && !isLoading ? (
          <div className="text-center py-10 bg-brand-dark rounded-lg border border-dashed border-brand-stroke">
              <p className="font-bold text-slate-300">No hay Pistas Configradas</p>
              <p className="text-sm text-slate-500 mt-2">Como administrador, por favor añade pistas para poder gestionar el calendario.</p>
          </div>
      ) : (
        <div className="overflow-x-auto">
          {renderGrid()}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;