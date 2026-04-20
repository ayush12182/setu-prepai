import { useState, useEffect } from 'react';

export type CommuneEventType = 'join' | 'solve' | 'finish' | 'streak';

export interface CommuneEvent {
  id: string;
  type: CommuneEventType;
  message: string;
  timestamp: number;
}

const FIRST_NAMES = [
  'Ayush', 'Rohan', 'Sneha', 'Priya', 'Aditya', 'Vikram', 'Ananya', 'Rahul', 'Karan', 'Neha',
  'Surya', 'Aarav', 'Ishaan', 'Diya', 'Kavya', 'Arjun', 'Siddharth', 'Meera', 'Riya', 'Dev'
];

const TOPICS = [
  'Integration', 'Rotational Mechanics', 'Electrostatics', 'Optics', 'Thermodynamics',
  'Chemical Bonding', 'Coordinate Geometry', 'Complex Numbers', 'Organic Chemistry'
];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateRandomEvent = (): CommuneEvent => {
  const type = getRandomItem(['join', 'solve', 'finish', 'streak'] as CommuneEventType[]);
  const name = getRandomItem(FIRST_NAMES);
  let message = '';

  switch (type) {
    case 'join':
      message = `${name} just joined a Focus Room 🔥`;
      break;
    case 'solve':
      message = `${name} solved ${Math.floor(Math.random() * 5) + 2} doubts today 🎯`;
      break;
    case 'finish':
      message = `Someone just completed ${getRandomItem(TOPICS)} ✅`;
      break;
    case 'streak':
      message = `${name} hit a ${Math.floor(Math.random() * 10) + 3} day study streak! ⚡`;
      break;
  }

  return {
    id: Math.random().toString(36).substring(7),
    type,
    message,
    timestamp: Date.now(),
  };
};

export const getSimulatedLiveCount = () => {
  const hour = new Date().getHours();
  // Peak hours: 8PM - 11PM (20-23) and 6AM - 9AM (6-9)
  let baseCount = 45;
  if ((hour >= 20 && hour <= 23) || (hour >= 6 && hour <= 9)) {
    baseCount = 120 + Math.floor(Math.random() * 50);
  } else if (hour >= 1 && hour <= 5) {
    baseCount = 15 + Math.floor(Math.random() * 20); // late night
  } else {
    baseCount = 60 + Math.floor(Math.random() * 40); // daytime
  }
  return baseCount;
};

// Hook to manage a live-feeling activity feed
export const useActivityFeed = (initialItems = 3) => {
  const [events, setEvents] = useState<CommuneEvent[]>([]);

  useEffect(() => {
    // Generate initial events
    const initial = Array.from({ length: initialItems }, generateRandomEvent);
    setEvents(initial);

    // Add a new event randomly every 8-20 seconds
    const interval = setInterval(() => {
      setEvents(prev => {
        const newEvents = [generateRandomEvent(), ...prev].slice(0, 10); // Keep last 10
        return newEvents;
      });
    }, 8000 + Math.random() * 12000);

    return () => clearInterval(interval);
  }, []);

  return events;
};
