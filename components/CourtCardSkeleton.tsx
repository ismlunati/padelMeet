
import React from 'react';

const CourtCardSkeleton: React.FC = () => {
  return (
    <div className="bg-brand-light-dark rounded-xl overflow-hidden shadow-lg border border-brand-stroke">
      <div className="animate-pulse">
        <div className="bg-slate-700 h-48 w-full"></div>
        <div className="p-5">
          <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="h-10 bg-slate-700 rounded-lg w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtCardSkeleton;
