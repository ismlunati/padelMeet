import React, { useState, useEffect, useCallback } from 'react';
import { Match, Player, Court, SlotInfo, TimeSlotRequest } from './types';
import { courtService } from './services/courtService';
import Header from './components/Header';
import PlayerDashboard from './components/CourtList';
import AdminDashboard from './components/TimeSlotPicker';
import InvitationModal from './components/InvitationModal';
import PlayerActionModal from './components/PlayerActionModal';

// Mock users with roles
const mockUsers: { [key: string]: Player } = {
    admin: { id: 'p1', name: 'Club Admin', avatarUrl: 'https://i.pravatar.cc/150?u=admin', role: 'admin' },
    player: { id: 'p8', name: 'Serena Williams', avatarUrl: 'https://i.pravatar.cc/150?u=serena', role: 'player' },
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<Player>(mockUsers.player);
    const [matches, setMatches] = useState<Match[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [timeSlotRequests, setTimeSlotRequests] = useState<TimeSlotRequest[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    // State for modals
    const [isInvitationModalOpen, setInvitationModalOpen] = useState<boolean>(false);
    const [contextForInvitation, setContextForInvitation] = useState<{ match?: Match, slotInfo?: SlotInfo }>({});
    
    const [isPlayerActionModalOpen, setPlayerActionModalOpen] = useState<boolean>(false);
    const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedMatches, fetchedPlayers, fetchedCourts, fetchedRequests] = await Promise.all([
                courtService.fetchAllMatches(),
                courtService.fetchAllPlayers(),
                courtService.fetchCourts(),
                courtService.fetchTimeSlotRequests(),
            ]);
            setMatches(fetchedMatches);
            setAllPlayers(fetchedPlayers);
            setCourts(fetchedCourts);
            setTimeSlotRequests(fetchedRequests);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Admin Actions
    const handleOpenInvitationModal = (context: { match?: Match, slotInfo?: SlotInfo }) => {
        setContextForInvitation(context);
        setInvitationModalOpen(true);
    };

    const handleInvitationSubmit = async (playerIds: string[]) => {
        const { match, slotInfo } = contextForInvitation;
        if (match) { // Inviting to an existing match
            await courtService.invitePlayersToMatch(match.id, playerIds);
        } else if (slotInfo) { // Creating a new match and inviting
            await courtService.createMatchAndInvite(slotInfo, currentUser, playerIds);
        }
        setInvitationModalOpen(false);
        setContextForInvitation({});
        fetchAllData();
    };
    
    // Player Actions
    const handleOpenPlayerActionModal = (slotInfo: SlotInfo) => {
        setSelectedSlot(slotInfo);
        setPlayerActionModalOpen(true);
    };

    const handleBookCourt = async () => {
        if (!selectedSlot) return;
        await courtService.bookCourt(selectedSlot.courtId, selectedSlot.date, selectedSlot.time, currentUser);
        setPlayerActionModalOpen(false);
        fetchAllData();
    };

    const handleAddTimeSlotRequest = async () => {
        if (!selectedSlot) return;
        await courtService.addTimeSlotRequest(currentUser.id, selectedSlot.date, selectedSlot.time);
        setPlayerActionModalOpen(false);
        fetchAllData();
    };

    const handleRespondToInvitation = async (matchId: string, response: 'ACCEPT' | 'DECLINE') => {
        try {
            await courtService.respondToInvitation(matchId, currentUser.id, response);
            fetchAllData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const toggleUserRole = () => {
        const newRole = currentUser.role === 'admin' ? 'player' : 'admin';
        const newUser = newRole === 'admin' 
            ? mockUsers.admin 
            : allPlayers.find(p => p.role === 'player' && p.id !== 'p1') || mockUsers.player;
        setCurrentUser(newUser);
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center text-slate-300 mt-10">Cargando...</div>;
        }

        if (currentUser.role === 'admin') {
            return (
                <AdminDashboard 
                    key={currentUser.id} 
                    matches={matches}
                    courts={courts}
                    players={allPlayers}
                    timeSlotRequests={timeSlotRequests}
                    onOpenInviteModal={handleOpenInvitationModal} 
                />
            );
        }
        
        return (
            <PlayerDashboard 
                matches={matches} 
                courts={courts}
                currentUser={currentUser}
                timeSlotRequests={timeSlotRequests}
                onRespondToInvitation={handleRespondToInvitation}
                onSlotClick={handleOpenPlayerActionModal}
                isLoading={isLoading} 
            />
        );
    };

    return (
        <div className="min-h-screen bg-brand-dark text-white font-sans">
            <Header>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                     <span className="text-sm text-slate-400 mr-4 hidden sm:inline">
                        Vista como: <span className="font-bold text-white">{currentUser.name} ({currentUser.role})</span>
                    </span>
                    <button
                        onClick={toggleUserRole}
                        className="bg-brand-stroke text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                    >
                        Cambiar Rol
                    </button>
                </div>
            </Header>
            <main className="container mx-auto px-4 py-8">
                {renderContent()}
            </main>
            {isInvitationModalOpen && (
                <InvitationModal
                    match={contextForInvitation.match || null}
                    slotInfo={contextForInvitation.slotInfo || null}
                    allPlayers={allPlayers.filter(p => p.id !== currentUser.id)}
                    timeSlotRequests={timeSlotRequests}
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
        </div>
    );
};

export default App;