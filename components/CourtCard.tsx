
import React from 'react';
import { Court } from '../types';
import { MapPinIcon, CurrencyEuroIcon, TennisRacketIcon } from './IconComponents';

interface CourtCardProps {
  court: Court;
  onSelectCourt: (court: Court) => void;
}

const CourtCard: React.FC<CourtCardProps> = ({ court, onSelectCourt }) => {
  return (
    <div className="bg-brand-light-dark rounded-xl overflow-hidden shadow-lg border border-brand-stroke transform hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/10 group">
      <div className="relative">
        <img className="w-full h-48 object-cover" src={court.imageUrl} alt={court.name} />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-xl font-bold text-white">{court.name}</h3>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center text-slate-400 mb-2">
            <MapPinIcon className="w-4 h-4 mr-2 text-brand-secondary" />
            <span>{court.location}</span>
        </div>
        <div className="flex items-center text-slate-400 mb-4">
            <TennisRacketIcon className="w-4 h-4 mr-2 text-brand-secondary" />
            <span>Superficie: {court.surface}</span>
        </div>
        
        <div className="flex justify-between items-center">
            <p className="text-xl font-semibold text-white flex items-center">
                <CurrencyEuroIcon className="w-5 h-5 mr-1 text-brand-primary" />
                {court.pricePerHour}
                <span className="text-sm font-normal text-slate-400 ml-1">/ hora</span>
            </p>
            <button
            onClick={() => onSelectCourt(court)}
            className="bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-dark font-bold py-2 px-5 rounded-lg transform transition-transform duration-300 group-hover:scale-105 shadow-md hover:shadow-lg hover:shadow-brand-primary/40"
            >
            Ver Horarios
            </button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;
