import React, { useState, useEffect, useCallback } from 'react';
import { Match, Player, Court, SlotInfo, TimeSlotRequest, OpeningHours } from './types';
import { courtService } from './services/courtService';
import Header from './components/Header';
import PlayerDashboard from './components/CourtList';
import AdminDashboard from './components/TimeSlotPicker';
import InvitationModal from './components/InvitationModal';
import PlayerActionModal from './components/PlayerActionModal';
import OpeningHoursManager from './components/OpeningHoursManager';
import Login from './components/Login';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<Player | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [openingHours, setOpeningHours] = useState<OpeningHours>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [isInvitationModalOpen, setInvitationModalOpen] = useState<boolean>(false);
    const [contextForInvitation, setContextForInvitation] = useState<{ match?: Match, slotInfo?: SlotInfo }>({});
    
    const [isPlayerActionModalOpen, setPlayerActionModalOpen] = useState<boolean>(false);
    const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
    const [isHoursModalOpen, setHoursModalOpen] = useState<boolean>(false);

    const fetchInitialData = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            const [fetchedPlayers, fetchedCourts, fetchedHours] = await Promise.all([
                courtService.fetchAllPlayers(),
                courtService.fetchCourts(),
                courtService.fetchOpeningHours(),
            ]);
            setAllPlayers(fetchedPlayers);
            setCourts(fetchedCourts);
            setOpeningHours(fetchedHours);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            // If token is invalid, log out
            if (error instanceof Error && error.message.includes('401')) {
                handleLogout();
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Check for existing token on app load
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            courtService.getMe().then(user => {
                setCurrentUser(user);
                setIsAuthenticated(true);
            }).catch(() => {
                localStorage.removeItem('authToken');
                setIsAuthenticated(false);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleLoginSuccess = (user: Player, token: string) => {
        localStorage.setItem('authToken', token);
        setCurrentUser(user);
        setIsAuthenticated(true);
    };
    
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    const handleInvitationSubmit = async (playerIds: string[]) => {
        const { match, slotInfo } = contextForInvitation;
        try {
            if (match) {
                await courtService.invitePlayersToMatch(match.id, playerIds);
            } else if (slotInfo) {
                await courtService.createMatchAndInvite(slotInfo, playerIds);
            }
            // Add a toast notification here in a real app
        } catch (error) {
            console.error("Failed to send invitations:", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setInvitationModalOpen(false);
            setContextForInvitation({});
            // The component showing the data should re-fetch, no global fetch needed
        }
    };
    
    const handleUpdateOpeningHours = async (newHours: OpeningHours) => {
        try {
            const updatedHours = await courtService.updateOpeningHours(newHours);
            setOpeningHours(updatedHours);
            setHoursModalOpen(false);
        } catch (error) {
            console.error("Failed to update opening hours:", error);
        }
    };
    
    const handleOpenPlayerActionModal = (slotInfo: SlotInfo) => {
        setSelectedSlot(slotInfo);
        setPlayerActionModalOpen(true);
    };

    const handleBookCourt = async () => {
        if (!selectedSlot) return;
        try {
            await courtService.bookCourt(selectedSlot.courtId, selectedSlot.date, selectedSlot.time);
            setPlayerActionModalOpen(false);
        } catch (error) {
            console.error("Failed to book court:", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    
    const handleAddTimeSlotRequest = async () => {
        if (!selectedSlot) return;
        try {
            await courtService.addTimeSlotRequest(selectedSlot.date, selectedSlot.time);
            setPlayerActionModalOpen(false);
        } catch (error) {
            console.error("Failed to add time slot request:", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center text-slate-300 mt-10">Cargando...</div>;
        }
        
        if (!isAuthenticated || !currentUser) {
            return <Login onLoginSuccess={handleLoginSuccess} />;
        }

        if (currentUser.role === 'admin') {
            return (
                <AdminDashboard 
                    courts={courts}
                    players={allPlayers}
                    openingHours={openingHours}
                    onOpenInviteModal={(ctx) => {
                        setContextForInvitation(ctx);
                        setInvitationModalOpen(true);
                    }}
                    onOpenHoursModal={() => setHoursModalOpen(true)}
                />
            );
        }
        
        return (
            <PlayerDashboard 
                courts={courts}
                currentUser={currentUser}
                openingHours={openingHours}
                onSlotClick={handleOpenPlayerActionModal}
            />
        );
    };
    
    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans">
            <Header>
                {isAuthenticated && currentUser && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                        <span className="text-sm text-slate-400 mr-4 hidden sm:inline">
                            <span className="font-bold text-white">{currentUser.name}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-brand-stroke text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-800/50 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </Header>
            <main className="container mx-auto px-4 py-8">
                {renderContent()}
            </main>
            {isInvitationModalOpen && (
                <InvitationModal
                    match={contextForInvitation.match || null}
                    slotInfo={contextForInvitation.slotInfo || null}
                    allPlayers={allPlayers.filter(p => p.id !== currentUser?.id)}
                    onClose={() => setInvitationModalOpen(false)}
                    onSubmit={handleInvitationSubmit}
                />
            )}
            {isPlayerActionModalOpen && selectedSlot && (
                <PlayerActionModal
                    slotInfo={selectedSlot}
                    onClose={() => setPlayerActionModalOpen(false)}
                    onBookCourt={handleBookCourt}
                    onAddTimeSlotRequest={handleAddTimeSlotRequest}
                />
            )}
            {isHoursModalOpen && (
                <OpeningHoursManager
                    currentHours={openingHours}
                    onClose={() => setHoursModalOpen(false)}
                    onSave={handleUpdateOpeningHours}
                />
            )}
        </div>
    );
};

export default App;
