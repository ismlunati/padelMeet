import React from 'react';
import { format, addDays, sub, isToday } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface DateNavigatorProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, onDateChange }) => {
  const isCurrentDateToday = isToday(currentDate);

  const handlePrevDay = () => {
    if (!isCurrentDateToday) {
      onDateChange(sub(currentDate, { days: 1 }));
    }
  };

  const handleNextDay = () => {
    onDateChange(addDays(currentDate, 1));
  };

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <button
        onClick={handlePrevDay}
        disabled={isCurrentDateToday}
        className="p-2 rounded-full bg-brand-stroke disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
        aria-label="Día anterior"
      >
        <ChevronLeftIcon className="w-6 h-6 text-slate-300" />
      </button>

      <div className="text-center">
        <p className="text-xl font-bold text-white capitalize w-48">
          {format(currentDate, "eeee, d 'de' MMMM", { locale: es })}
        </p>
        {isCurrentDateToday && (
           <p className="text-sm font-semibold text-brand-primary">Hoy</p>
        )}
      </div>

      <button
        onClick={handleNextDay}
        className="p-2 rounded-full bg-brand-stroke hover:bg-slate-700 transition-colors"
        aria-label="Día siguiente"
      >
        <ChevronRightIcon className="w-6 h-6 text-slate-300" />
      </button>
    </div>
  );
};

export default DateNavigator;