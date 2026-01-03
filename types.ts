
export type Status = 'done' | 'not_done' | 'not_applicable' | 'empty';
export type Mood = 'stellar' | 'good' | 'neutral' | 'low' | 'bad' | 'none';

export interface DailyLog {
  [day: number]: Status;
}

export interface Activity {
  id: string;
  name: string;
  emoji: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  logs: {
    [monthYear: string]: DailyLog;
  };
}

export interface UserSettings {
  nickname: string;
  theme: 'light' | 'dark';
  accentColor: string;
  fontFamily: 'Inter' | 'Outfit' | 'Serif' | 'Mono';
  statusColors: {
    done: string;
    not_done: string;
    not_applicable: string;
  };
}

export interface MonthlyJournal {
  content: string;
}

// Added Task interface to resolve member missing error in DailyTasksView
export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface AppState {
  activities: Activity[];
  settings: UserSettings;
  moods: {
    [monthYear: string]: { [day: number]: Mood };
  };
  journals: {
    [monthYear: string]: MonthlyJournal;
  };
  // Added tasks property to AppState to resolve missing property error
  tasks: {
    [monthYear: string]: { [day: number]: Task[] };
  };
}
