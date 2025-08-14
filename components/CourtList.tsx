
import React from 'react';
import { Court } from '../types';
import CourtCard from './CourtCard';
import CourtCardSkeleton from './CourtCardSkeleton';

interface CourtListProps {
  courts: Court[];
  onSelectCourt: (court: Court) => void;
  isLoading: boolean;
}

const CourtList: React.FC<CourtListProps> = ({ courts, onSelectCourt, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <CourtCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-slate-300">No hay pistas disponibles</h2>
        <p className="text-slate-400 mt-2">Intenta seleccionar otra fecha o vuelve más tarde.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
      {courts.map((court) => (
        <CourtCard key={court.id} court={court} onSelectCourt={onSelectCourt} />
      ))}
    </div>
  );
};

export default CourtList;
