import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isBefore
} from 'date-fns';
import subMonths from 'date-fns/subMonths';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import startOfToday from 'date-fns/startOfToday';
import { es } from 'date-fns/locale/es';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const today = startOfToday();

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    if (!isBefore(newMonth, startOfMonth(today))) {
        setCurrentMonth(newMonth);
    }
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
  
  const isPrevMonthDisabled = isSameMonth(currentMonth, today);

  return (
    <div className="bg-brand-light-dark p-4 rounded-xl border border-brand-stroke shadow-lg animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={prevMonth}
          disabled={isPrevMonthDisabled}
          className="p-2 rounded-full hover:bg-brand-stroke transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-5 h-5 text-slate-300" />
        </button>
        <h3 className="text-lg font-bold text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-brand-stroke transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isPast = isBefore(day, today);
          const isTodayFlag = isSameDay(day, today);

          return (
            <button
              key={day.toString()}
              onClick={() => onDateChange(day)}
              disabled={isPast}
              className={`
                w-full aspect-square rounded-full text-sm font-semibold transition-all duration-200
                flex items-center justify-center
                ${isCurrentMonth ? 'text-white' : 'text-slate-600'}
                ${isPast ? 'cursor-not-allowed opacity-50' : 'hover:bg-brand-stroke'}
                ${isSelected ? 'bg-brand-primary text-brand-dark ring-2 ring-brand-primary/50' : ''}
                ${!isSelected && isTodayFlag ? 'border border-brand-secondary' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default Calendar;