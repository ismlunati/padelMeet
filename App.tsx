
import React, { useState, useEffect, useCallback } from 'react';
import { Court, ViewState } from './types';
import { courtService } from './services/courtService';
import Header from './components/Header';
import CourtList from './components/CourtList';
import TimeSlotPicker from './components/TimeSlotPicker';
import BookingConfirmation from './components/BookingConfirmation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import Calendar from './components/Calendar';

const App: React.FC = () => {
    const [view, setView] = useState<ViewState>(ViewState.LIST);
    const [courts, setCourts] = useState<Court[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

    useEffect(() => {
        const fetchCourts = async () => {
            setIsLoading(true);
            try {
                const fetchedCourts = await courtService.fetchCourts();
                setCourts(fetchedCourts);
            } catch (error) {
                console.error("Failed to fetch courts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourts();
    }, []);

    const handleSelectCourt = useCallback((court: Court) => {
        setSelectedCourt(court);
        setView(ViewState.TIMES);
    }, []);

    const handleDateChange = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);

    const handleSelectTime = useCallback((time: string) => {
        setSelectedTime(time);
        setView(ViewState.CONFIRM);
    }, []);

    const handleConfirmBooking = useCallback(() => {
        // Simulate booking
        console.log(`Booking confirmed for ${selectedCourt?.name} on ${format(selectedDate, 'PPP', { locale: es })} at ${selectedTime}`);
        setBookingSuccess(true);
        setTimeout(() => {
            setView(ViewState.LIST);
            setSelectedCourt(null);
            setSelectedTime(null);
            setBookingSuccess(false);
        }, 3000);
    }, [selectedCourt, selectedDate, selectedTime]);

    const handleBack = useCallback(() => {
        if (view === ViewState.CONFIRM) {
            setView(ViewState.TIMES);
            setSelectedTime(null);
        } else if (view === ViewState.TIMES) {
            setView(ViewState.LIST);
            setSelectedCourt(null);
        }
    }, [view]);

    const renderContent = () => {
        if (bookingSuccess) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in h-[60vh]">
                    <svg className="w-24 h-24 text-brand-primary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h2 className="text-3xl font-bold text-white mb-2">¡Reserva Confirmada!</h2>
                    <p className="text-slate-300">Hemos enviado los detalles a tu correo. ¡A disfrutar del partido!</p>
                </div>
            );
        }
        
        switch (view) {
            case ViewState.TIMES:
                if (selectedCourt) {
                    return <TimeSlotPicker court={selectedCourt} date={selectedDate} onSelectTime={handleSelectTime} onBack={handleBack} />;
                }
                return null;
            case ViewState.CONFIRM:
                if (selectedCourt && selectedTime) {
                    return <BookingConfirmation court={selectedCourt} date={selectedDate} time={selectedTime} onConfirm={handleConfirmBooking} onBack={handleBack} />;
                }
                return null;
            case ViewState.LIST:
            default:
                return (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        <div className="lg:col-span-4 xl:col-span-3 mb-8 lg:mb-0">
                            <Calendar selectedDate={selectedDate} onDateChange={handleDateChange} />
                        </div>
                        <div className="lg:col-span-8 xl:col-span-9">
                            <div className="mb-4 animate-fade-in">
                               <h2 className="text-2xl font-bold text-white">Pistas Disponibles</h2>
                               <p className="text-slate-400 capitalize">
                                 para el {format(selectedDate, "eeee, d 'de' MMMM", { locale: es })}
                               </p>
                            </div>
                            <CourtList courts={courts} onSelectCourt={handleSelectCourt} isLoading={isLoading} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
