import React from 'react';
import { SlotInfo } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface PlayerActionModalProps {
    slotInfo: SlotInfo;
    onClose: () => void;
    onBookCourt: () => void;
    onAddTimeSlotRequest: () => void;
}

const PlayerActionModal: React.FC<PlayerActionModalProps> = ({ slotInfo, onClose, onBookCourt, onAddTimeSlotRequest }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-brand-light-dark w-full max-w-lg rounded-2xl shadow-2xl border border-brand-stroke flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-brand-stroke text-center">
                    <h2 className="text-2xl font-bold text-white">Elegir Acción</h2>
                    <p className="text-slate-400">
                        {slotInfo.courtName} - {format(slotInfo.date, "eeee d", { locale: es })} a las {slotInfo.time}
                    </p>
                </div>

                <div className="p-6 flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option 1: Book Full Court */}
                    <div className="bg-brand-stroke p-6 rounded-lg text-center flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2">Reservar Pista Completa</h3>
                        <p className="text-slate-400 flex-grow mb-6">¿Ya tienes a tus 3 compañeros? Reserva la pista directamente.</p>
                        <button
                            onClick={onBookCourt}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Reservar
                        </button>
                    </div>

                    {/* Option 2: Request Time Slot */}
                    <div className="bg-brand-stroke p-6 rounded-lg text-center flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2">Apuntarme para esta hora</h3>
                        <p className="text-slate-400 flex-grow mb-6">Avisa al admin de que quieres jugar a las {slotInfo.time} y él organizará el partido.</p>
                         <button
                            onClick={onAddTimeSlotRequest}
                            className="w-full bg-teal-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                            Apuntarme
                        </button>
                    </div>
                </div>
                
                <div className="p-4 border-t border-brand-stroke flex justify-center">
                    <button onClick={onClose} className="text-slate-400 font-bold py-2 px-5 rounded-lg hover:bg-brand-stroke transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayerActionModal;