
import React, { useState, useEffect } from 'react';
import { Court, TimeSlot } from '../types';
import { courtService } from '../services/courtService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ChevronLeftIcon } from './IconComponents';

interface TimeSlotPickerProps {
  court: Court;
  date: Date;
  onSelectTime: (time: string) => void;
  onBack: () => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ court, date, onSelectTime, onBack }) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      const slots = await courtService.fetchAvailability(court.id, date);
      setTimeSlots(slots);
      setIsLoading(false);
    };
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [court.id, date]);

  return (
    <div className="bg-brand-light-dark p-6 sm:p-8 rounded-xl border border-brand-stroke shadow-2xl shadow-brand-secondary/10 animate-slide-in-up">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 mr-4 rounded-full hover:bg-brand-stroke transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-slate-300" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-white">{court.name}</h2>
            <p className="text-slate-400 capitalize">{format(date, 'eeee, d MMMM', { locale: es })}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index} className="h-12 bg-slate-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => onSelectTime(slot.time)}
              disabled={!slot.isAvailable}
              className={`py-3 px-2 rounded-lg font-semibold text-center transition-all duration-200 
                ${slot.isAvailable 
                  ? 'bg-brand-stroke text-white hover:bg-brand-primary hover:text-brand-dark transform hover:scale-105' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed line-through'
                }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
