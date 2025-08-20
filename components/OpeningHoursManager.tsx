import React, { useState } from 'react';
import { OpeningHours } from '../types';

interface OpeningHoursManagerProps {
    currentHours: OpeningHours;
    onClose: () => void;
    onSave: (newHours: OpeningHours) => Promise<void>;
}

const ALL_POSSIBLE_SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"];
const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const OpeningHoursManager: React.FC<OpeningHoursManagerProps> = ({ currentHours, onClose, onSave }) => {
    const [editedHours, setEditedHours] = useState<OpeningHours>(JSON.parse(JSON.stringify(currentHours)));
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (dayIndex: number, time: string) => {
        setEditedHours(prev => {
            const newHours = { ...prev };
            const daySlots = newHours[dayIndex] ? [...newHours[dayIndex]] : [];
            const timeIndex = daySlots.indexOf(time);

            if (timeIndex > -1) {
                daySlots.splice(timeIndex, 1);
            } else {
                daySlots.push(time);
                daySlots.sort();
            }
            
            newHours[dayIndex] = daySlots;
            return newHours;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(editedHours);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-brand-light-dark w-full max-w-4xl rounded-2xl shadow-2xl border border-brand-stroke flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-brand-stroke">
                    <h2 className="text-2xl font-bold text-white">Gestionar Horarios de Apertura</h2>
                    <p className="text-slate-400">Selecciona las franjas horarias en las que el club estará abierto.</p>
                </div>

                <div className="p-6 flex-grow overflow-y-auto max-h-[70vh] space-y-6">
                    {DAYS_OF_WEEK.map((dayName, dayIndex) => (
                        <div key={dayIndex}>
                            <h3 className="text-lg font-bold text-brand-primary mb-3">{dayName}</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {ALL_POSSIBLE_SLOTS.map(time => {
                                    const isActive = editedHours[dayIndex]?.includes(time) ?? false;
                                    return (
                                        <button
                                            key={time}
                                            onClick={() => handleToggle(dayIndex, time)}
                                            className={`py-2 px-3 rounded-md font-semibold text-sm transition-all duration-200 ${
                                                isActive 
                                                ? 'bg-brand-primary text-brand-dark shadow-md' 
                                                : 'bg-brand-stroke text-slate-400 hover:bg-slate-700'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="p-6 border-t border-brand-stroke flex justify-end gap-4">
                    <button onClick={onClose} className="bg-brand-stroke text-white font-bold py-2 px-5 rounded-lg hover:bg-slate-700 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-dark font-bold py-2 px-5 rounded-lg disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpeningHoursManager;
