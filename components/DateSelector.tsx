
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (direction: 'prev' | 'next') => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  return (
    <div className="flex items-center justify-center space-x-4 mb-8 animate-fade-in">
      <button 
        onClick={() => onDateChange('prev')} 
        disabled={isToday}
        className="p-2 rounded-full bg-brand-light-dark border border-brand-stroke hover:bg-brand-stroke disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="w-6 h-6 text-slate-300" />
      </button>
      <div className="text-center">
        <p className="text-xl md:text-2xl font-bold text-white capitalize">
          {format(selectedDate, 'eeee, d', { locale: es })}
        </p>
        <p className="text-sm text-slate-400 capitalize">
          {format(selectedDate, 'MMMM yyyy', { locale: es })}
        </p>
      </div>
      <button 
        onClick={() => onDateChange('next')} 
        className="p-2 rounded-full bg-brand-light-dark border border-brand-stroke hover:bg-brand-stroke transition-colors"
      >
        <ChevronRightIcon className="w-6 h-6 text-slate-300" />
      </button>
    </div>
  );
};

export default DateSelector;
