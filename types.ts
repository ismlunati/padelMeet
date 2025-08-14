
export interface Court {
  id: string;
  name: string;
  location: string;
  pricePerHour: number;
  imageUrl: string;
  surface: 'Clay' | 'Hard' | 'Grass';
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export enum ViewState {
  LIST = 'LIST',
  TIMES = 'TIMES',
  CONFIRM = 'CONFIRM',
}
