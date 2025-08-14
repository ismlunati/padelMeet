
import React from 'react';
import { Court } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { MapPinIcon, CurrencyEuroIcon } from './IconComponents';

interface BookingConfirmationProps {
  court: Court;
  date: Date;
  time: string;
  onConfirm: () => void;
  onBack: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ court, date, time, onConfirm, onBack }) => {
  return (
    <div className="max-w-2xl mx-auto bg-brand-light-dark p-6 sm:p-8 rounded-xl border border-brand-stroke shadow-2xl shadow-brand-primary/10 animate-slide-in-up">
      <h2 className="text-3xl font-bold text-center mb-2 text-white">Confirma tu Reserva</h2>
      <p className="text-slate-400 text-center mb-8">Estás a un paso de asegurar tu pista.</p>

      <div className="bg-brand-dark p-6 rounded-lg border border-brand-stroke space-y-4 mb-8">
        <div>
          <p className="text-sm text-slate-400">Pista</p>
          <p className="text-lg font-semibold text-white">{court.name}</p>
          <div className="flex items-center text-sm text-slate-400 mt-1">
            <MapPinIcon className="w-4 h-4 mr-2" />
            <span>{court.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm text-slate-400">Fecha</p>
                <p className="text-lg font-semibold text-white capitalize">{format(date, 'eeee, d MMM', { locale: es })}</p>
            </div>
            <div>
                <p className="text-sm text-slate-400">Hora</p>
                <p className="text-lg font-semibold text-white">{time}</p>
            </div>
        </div>
        
        <div>
            <p className="text-sm text-slate-400">Precio</p>
            <div className="flex items-baseline text-lg font-semibold text-white">
                <CurrencyEuroIcon className="w-5 h-5 mr-1.5 text-brand-primary"/>
                <span className="text-2xl">{court.pricePerHour}</span>
                <span className="text-sm font-normal text-slate-400 ml-1">/ hora</span>
            </div>
        </div>

      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="w-full py-3 px-6 rounded-lg font-bold bg-brand-stroke text-white hover:bg-slate-600 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onConfirm}
          className="w-full py-3 px-6 rounded-lg font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-dark shadow-lg hover:shadow-brand-primary/40 transform hover:scale-105 transition-all"
        >
          Confirmar Reserva
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
