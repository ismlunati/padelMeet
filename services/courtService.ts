
import { Court, TimeSlot } from '../types';

const courts: Court[] = [
  {
    id: '1',
    name: 'Pista Central - Cristal',
    location: 'Club Padel Indoor Center',
    pricePerHour: 24,
    imageUrl: 'https://picsum.photos/seed/padel1/600/400',
    surface: 'Hard',
  },
  {
    id: '2',
    name: 'Pista Panorámica',
    location: 'Club Padel Indoor Center',
    pricePerHour: 28,
    imageUrl: 'https://picsum.photos/seed/padel2/600/400',
    surface: 'Hard',
  },
  {
    id: '3',
    name: 'Pista Outdoor 1',
    location: 'City Padel Club',
    pricePerHour: 18,
    imageUrl: 'https://picsum.photos/seed/padel3/600/400',
    surface: 'Clay',
  },
  {
    id: '4',
    name: 'Pista de Competición',
    location: 'Pro Padel Academy',
    pricePerHour: 30,
    imageUrl: 'https://picsum.photos/seed/padel4/600/400',
    surface: 'Hard',
  },
    {
    id: '5',
    name: 'Pista Norte',
    location: 'City Padel Club',
    pricePerHour: 18,
    imageUrl: 'https://picsum.photos/seed/padel5/600/400',
    surface: 'Clay',
  },
  {
    id: '6',
    name: 'Pista VIP',
    location: 'Pro Padel Academy',
    pricePerHour: 35,
    imageUrl: 'https://picsum.photos/seed/padel6/600/400',
    surface: 'Hard',
  },
];

const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let i = 9; i <= 22; i++) {
        slots.push({ time: `${i}:00`, isAvailable: Math.random() > 0.3 });
        if (i < 22) {
           slots.push({ time: `${i}:30`, isAvailable: Math.random() > 0.3 });
        }
    }
    return slots;
};


export const courtService = {
  fetchCourts: (): Promise<Court[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(courts);
      }, 1000); // Simulate network delay
    });
  },

  fetchAvailability: (courtId: string, date: Date): Promise<TimeSlot[]> => {
     console.log(`Fetching availability for court ${courtId} on date ${date.toISOString()}`);
     return new Promise(resolve => {
         setTimeout(() => {
             resolve(generateTimeSlots(date));
         }, 500); // Simulate network delay
     });
  }
};
