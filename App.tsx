
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, BarChart3, Settings as SettingsIcon, 
  Sun, Moon, CalendarRange, ArrowRight, BookOpen, ListTodo
} from 'lucide-react';
import { Activity, UserSettings, AppState, Status, Mood, Task } from './types';
import { DEFAULT_SETTINGS, DEFAULT_ACTIVITIES } from './constants';
import TrackerView from './components/TrackerView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import TrackerOverview from './components/TrackerOverview';
import JournalView from './components/JournalView';
import DailyTasksView from './components/DailyTasksView';

const STORAGE_KEY = 'trackyy_master_v1';

const TrackyyLogo: React.FC<{ size?: number, color?: string }> = ({ size = 24, color = "currentColor" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-sm"
  >
    <rect x="2" y="2" width="20" height="20" rx="6" fill={color} fillOpacity="0.15" />
    <path 
      d="M7 13L10 16L17 8" 
      stroke={color} 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M4 18C4 18 6 14 10 14C14 14 16 18 20 18" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeDasharray="1 4"
    />
  </svg>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.journals) parsed.journals = {};
      if (!parsed.tasks) parsed.tasks = {};
      return parsed;
    }
    return {
      activities: DEFAULT_ACTIVITIES,
      settings: DEFAULT_SETTINGS,
      moods: {},
      journals: {},
      tasks: {},
    };
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    if (!state.settings.nickname && !localStorage.getItem('onboarded')) {
      setShowOnboarding(true);
    }
  }, [state]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
  };

  const toggleTheme = () => {
    updateSettings({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      updateSettings({ nickname: tempName.trim() });
      localStorage.setItem('onboarded', 'true');
      setShowOnboarding(false);
    }
  };

  const addActivity = (name: string, emoji: string) => {
    const newAct: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      name, emoji, color: state.settings.accentColor, priority: 'medium', logs: {}
    };
    setState(prev => ({ ...prev, activities: [...prev.activities, newAct] }));
  };

  const updateLog = (activityId: string, monthYear: string, day: number, status: Status) => {
    setState(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === activityId ? {
        ...a,
        logs: { ...a.logs, [monthYear]: { ...(a.logs[monthYear] || {}), [day]: status } }
      } : a)
    }));
  };

  const updateMood = (monthYear: string, day: number, mood: Mood) => {
    setState(prev => ({
      ...prev,
      moods: { ...prev.moods, [monthYear]: { ...(prev.moods[monthYear] || {}), [day]: mood } }
    }));
  };

  const updateJournal = (monthYear: string, content: string) => {
    setState(prev => ({
      ...prev,
      journals: {
        ...prev.journals,
        [monthYear]: { content }
      }
    }));
  };

  const updateTasks = (monthYear: string, day: number, tasks: Task[]) => {
    setState(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [monthYear]: {
          ...(prev.tasks[monthYear] || {}),
          [day]: tasks
        }
      }
    }));
  };

  const deleteActivity = (id: string) => {
    setState(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== id) }));
  };

  const fontClass = {
    'Inter': 'font-sans',
    'Outfit': 'font-outfit',
    'Serif': 'font-serif',
    'Mono': 'font-mono'
  }[state.settings.fontFamily] || 'font-sans';

  return (
    <HashRouter>
      <div 
        className={`h-screen flex flex-col lg:flex-row bg-soft-50 dark:bg-gray-950 transition-colors duration-500 ${fontClass} overflow-hidden`}
        style={{ '--accent': state.settings.accentColor } as any}
      >
        {/* Onboarding Overlay */}
        {showOnboarding && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-white dark:bg-gray-950">
            <div className="max-w-md w-full px-8 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800">
                  <TrackyyLogo size={48} color={state.settings.accentColor} />
                </div>
              </div>
              <h1 className="text-4xl font-black dark:text-white mb-3">Welcome to Trackyy</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
                Your journey to better habits starts here. <br/> How should we call you?
              </p>
              <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Enter your nickname"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-soft-100 dark:bg-gray-900 px-6 py-5 rounded-[2rem] border-2 border-transparent focus:border-blue-500/30 outline-none text-center text-xl font-bold dark:text-white transition-all shadow-inner"
                />
                <button 
                  disabled={!tempName.trim()}
                  className="w-full flex items-center justify-center gap-2 text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all hover:translate-y-[-2px] active:translate-y-0"
                  style={{ backgroundColor: state.settings.accentColor }}
                >
                  Get Started <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Global Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-72 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-r border-gray-100 dark:border-gray-800 p-8 h-full">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-gray-800 shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700">
              <TrackyyLogo size={30} color={state.settings.accentColor} />
            </div>
            <div>
              <h1 className="text-xl font-black dark:text-white leading-none tracking-tight">Trackyy</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 truncate max-w-[140px]" style={{ color: state.settings.accentColor }}>
                {state.settings.nickname ? `${state.settings.nickname}'s Pulse` : 'Core Tracker'}
              </p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            <SidebarLink to="/" icon={<LayoutGrid size={19} />} label="Daily Tracker" accent={state.settings.accentColor} />
            <SidebarLink to="/tasks" icon={<ListTodo size={19} />} label="Today's Mission" accent={state.settings.accentColor} />
            <SidebarLink to="/overview" icon={<CalendarRange size={19} />} label="Overview Hall" accent={state.settings.accentColor} />
            <SidebarLink to="/journal" icon={<BookOpen size={19} />} label="Monthly Reflection" accent={state.settings.accentColor} />
            <SidebarLink to="/analytics" icon={<BarChart3 size={19} />} label="Deep Insights" accent={state.settings.accentColor} />
            <SidebarLink to="/settings" icon={<SettingsIcon size={19} />} label="Settings" accent={state.settings.accentColor} />
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={toggleTheme}
              className="w-full py-3.5 bg-soft-100/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center gap-3 transition-all hover:bg-soft-100 dark:hover:bg-gray-800 shadow-sm group"
            >
              <div className="transition-transform group-hover:rotate-12">
                {state.settings.theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} style={{ color: state.settings.accentColor }} />}
              </div>
              <span className="font-bold text-sm dark:text-gray-300">
                {state.settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </aside>

        {/* Header (Mobile & Brand Consistency) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900 sticky top-0 z-[100] lg:px-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900 shadow-lg shadow-black/5 border border-gray-100 dark:border-gray-800">
                <TrackyyLogo size={24} color={state.settings.accentColor} />
              </div>
              <h1 className="text-lg font-black dark:text-white tracking-tight">Trackyy</h1>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Desktop Nickname Badge */}
               <div className="hidden md:flex items-center gap-2 bg-soft-100/50 dark:bg-gray-900/50 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: state.settings.accentColor }} />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {state.settings.nickname || 'Tracker'}
                  </span>
               </div>
               
               <button 
                onClick={toggleTheme}
                className="p-2.5 bg-soft-100/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
               >
                {state.settings.theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} style={{ color: state.settings.accentColor }} />}
               </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-28 lg:pb-10 no-scrollbar">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={
                  <TrackerView 
                    state={state} 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                    updateLog={updateLog}
                    updateMood={updateMood}
                    addActivity={addActivity}
                    deleteActivity={deleteActivity}
                  />
                } />
                <Route path="/tasks" element={<DailyTasksView state={state} updateTasks={updateTasks} />} />
                <Route path="/overview" element={<TrackerOverview state={state} onSelectMonth={(d) => setCurrentDate(d)} />} />
                <Route path="/journal" element={<JournalView state={state} updateJournal={updateJournal} />} />
                <Route path="/analytics" element={<AnalyticsView state={state} />} />
                <Route path="/settings" element={<SettingsView settings={state.settings} updateSettings={updateSettings} />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-900 flex items-center justify-around px-4 pb-2 z-[100]">
          <MobileNavLink to="/" icon={<LayoutGrid size={22} />} label="Grid" accent={state.settings.accentColor} />
          <MobileNavLink to="/tasks" icon={<ListTodo size={22} />} label="Tasks" accent={state.settings.accentColor} />
          <MobileNavLink to="/overview" icon={<CalendarRange size={22} />} label="History" accent={state.settings.accentColor} />
          <MobileNavLink to="/journal" icon={<BookOpen size={22} />} label="Reflection" accent={state.settings.accentColor} />
          <MobileNavLink to="/analytics" icon={<BarChart3 size={22} />} label="Stats" accent={state.settings.accentColor} />
          <MobileNavLink to="/settings" icon={<SettingsIcon size={22} />} label="Settings" accent={state.settings.accentColor} />
        </nav>
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, accent: string }> = ({ to, icon, label, accent }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold ${
      active ? 'text-white shadow-lg shadow-blue-500/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-soft-100/50 dark:hover:bg-gray-800'
    }`} style={{ backgroundColor: active ? accent : 'transparent' }}>
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
};

const MobileNavLink: React.FC<{ to: string, icon: React.ReactNode, label: string, accent: string }> = ({ to, icon, label, accent }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 transition-all ${
      active ? 'scale-110' : 'text-gray-400 dark:text-gray-500'
    }`} style={{ color: active ? accent : '' }}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </Link>
  );
};

export default App;
