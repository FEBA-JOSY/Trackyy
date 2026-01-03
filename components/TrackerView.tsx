
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, Sparkles, 
  Check, X, Minus, Smile, Clock, Calendar as CalendarIcon
} from 'lucide-react';
import { AppState, Status, Mood } from '../types';
import { MONTH_NAMES, MOODS } from '../constants';
import { getMotivationalQuote } from '../services/geminiService';
import { Celebration } from './Celebration';

interface Props {
  state: AppState;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  updateLog: (activityId: string, monthYear: string, day: number, status: Status) => void;
  updateMood: (monthYear: string, day: number, mood: Mood) => void;
  addActivity: (name: string, emoji: string) => void;
  deleteActivity: (id: string) => void;
}

const EMOJI_OPTIONS = [
  '🔥', '🧘', '🏃', '🧠', '📚', '💧', '🥗', '🛌', '🎸', '🎨', 
  '🎮', '🍿', '🎧', '🧹', '🍳', '🪴', '🧺', '🛠️', '✍️', '🎯'
];

const TrackerView: React.FC<Props> = ({ state, currentDate, setCurrentDate, updateLog, updateMood, addActivity, deleteActivity }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityEmoji, setNewActivityEmoji] = useState("🔥");
  
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [quote, setQuote] = useState("");
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [now, setNow] = useState(new Date());

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthYearKey = `${year}-${month + 1}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoadingQuote(true);
      let done = 0, total = 0;
      state.activities.forEach(a => {
        const logs = a.logs[monthYearKey] || {};
        Object.values(logs).forEach(s => {
          if (s === 'done') done++;
          if (s !== 'empty') total++;
        });
      });
      const rate = total === 0 ? 0 : Math.round((done / total) * 100);
      const q = await getMotivationalQuote({ completionRate: rate, activityCount: state.activities.length, monthName: MONTH_NAMES[month] });
      setQuote(q);
      setLoadingQuote(false);
    };
    fetchQuote();
  }, [month, year, state.activities.length]);

  const toggleStatus = (activityId: string, day: number) => {
    const activity = state.activities.find(a => a.id === activityId);
    const currentStatus = activity?.logs[monthYearKey]?.[day] || 'empty';
    
    let statusToApply: Status = 'done';
    if (currentStatus === 'done') statusToApply = 'not_done';
    else if (currentStatus === 'not_done') statusToApply = 'not_applicable';
    else if (currentStatus === 'not_applicable') statusToApply = 'empty';

    updateLog(activityId, monthYearKey, day, statusToApply);
    if (statusToApply === 'done') {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 3000);
    }
  };

  const handleAddActivity = () => {
    if (newActivityName.trim()) {
      addActivity(newActivityName.trim(), newActivityEmoji);
      setNewActivityName("");
      setNewActivityEmoji("🔥");
      setIsAdding(false);
    }
  };

  const getStatusColor = (status: Status) => {
    if (status === 'empty') return 'transparent';
    return state.settings.statusColors[status as keyof typeof state.settings.statusColors];
  };

  const renderStatusIcon = (status: Status) => {
    switch (status) {
      case 'done': return <Check size={14} className="text-white" strokeWidth={4} />;
      case 'not_done': return <X size={14} className="text-white" strokeWidth={4} />;
      case 'not_applicable': return <Minus size={14} className="text-white" strokeWidth={4} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <Celebration active={isCelebrating} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]" style={{ color: state.settings.accentColor }}>
            Hey {state.settings.nickname || 'Tracker'},
          </p>
          <h1 className="text-3xl md:text-5xl font-black dark:text-white flex items-center gap-3">
            {MONTH_NAMES[month]} <span style={{ color: state.settings.accentColor }}>{year}</span>
          </h1>
          <div className="min-h-[1.5rem] flex items-center">
            <p className="text-gray-400 font-medium flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400 shrink-0" />
              {loadingQuote ? "Wait a moment..." : quote}
            </p>
          </div>
        </div>

        {/* Date & Clock Widget */}
        <div className="bg-white/80 dark:bg-gray-900/80 px-6 py-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
          <div className="flex items-center gap-3 pr-5 border-r border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-soft-100 dark:bg-gray-800">
              <CalendarIcon size={20} style={{ color: state.settings.accentColor }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today</p>
              <p className="text-sm font-black dark:text-white whitespace-nowrap">
                {now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-soft-100 dark:bg-gray-800">
              <Clock size={20} style={{ color: state.settings.accentColor }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</p>
              <p className="text-sm font-black dark:text-white">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex bg-white dark:bg-gray-900 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-800">
          <NavButton onClick={() => setCurrentDate(new Date(year, month - 1, 1))} icon={<ChevronLeft size={18} />} />
          <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 text-xs font-bold text-gray-500 dark:text-gray-300 hover:bg-soft-100 dark:hover:bg-gray-800 rounded-xl transition-all">Go to Today</button>
          <NavButton onClick={() => setCurrentDate(new Date(year, month + 1, 1))} icon={<ChevronRight size={18} />} />
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto no-scrollbar relative">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-soft-100/50 dark:bg-gray-800/20">
                <th className="sticky left-0 z-30 bg-soft-100/90 dark:bg-gray-900/90 backdrop-blur-md px-4 md:px-8 py-5 text-left min-w-[150px] md:min-w-[250px]">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Activity Grid</span>
                </th>
                {daysArray.map(day => (
                  <th key={day} className="px-1 md:px-2 py-5 text-center min-w-[36px] md:min-w-[44px]">
                    <div className={`text-[10px] font-black ${isCurrentMonth && today.getDate() === day ? 'text-blue-500 font-bold' : 'text-gray-300'}`}>
                      {day}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
              {state.activities.map((activity) => {
                const logs = activity.logs[monthYearKey] || {};
                return (
                  <tr key={activity.id} className="group hover:bg-soft-100/30 dark:hover:bg-gray-800/10 transition-colors h-[72px]">
                    <td className="sticky left-0 z-30 bg-white/95 dark:bg-gray-900/95 px-4 md:px-8 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-lg shrink-0 w-8 h-8 flex items-center justify-center bg-soft-100 dark:bg-gray-800 rounded-xl">{activity.emoji}</span>
                        <p className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{activity.name}</p>
                      </div>
                      <button onClick={() => deleteActivity(activity.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10">
                        <Trash2 size={14} />
                      </button>
                    </td>
                    {daysArray.map(day => {
                      const status = logs[day] || 'empty';
                      const color = getStatusColor(status);
                      return (
                        <td key={day} className="px-0.5 md:px-1 py-3 text-center">
                          <button
                            onClick={() => toggleStatus(activity.id, day)}
                            className={`w-7 h-7 md:w-9 md:h-9 rounded-xl transition-all transform flex items-center justify-center border-2 ${
                              status === 'empty' ? 'border-soft-200 dark:border-gray-800' : 'border-transparent shadow-md'
                            } hover:scale-110 active:scale-95`}
                            style={{ backgroundColor: color }}
                          >
                            {renderStatusIcon(status)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Mood Track */}
              <tr className="bg-soft-100/10 dark:bg-gray-800/10 h-[72px]">
                <td className="sticky left-0 z-30 bg-white dark:bg-gray-900 px-4 md:px-8 py-4">
                  <div className="flex items-center gap-2">
                    <Smile size={18} className="text-gray-400" />
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Energy</span>
                  </div>
                </td>
                {daysArray.map(day => {
                  const currentMood = state.moods[monthYearKey]?.[day] || 'none';
                  const moodObj = MOODS.find(m => m.type === currentMood);
                  return (
                    <td key={day} className="px-0.5 py-3 text-center">
                      <div className="relative group/mood flex justify-center">
                        <button className={`w-7 h-7 flex items-center justify-center text-sm transition-transform hover:scale-125 ${currentMood !== 'none' ? '' : 'opacity-20 grayscale'}`}>
                          {moodObj?.emoji || '😶'}
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/mood:flex bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-2xl z-50 gap-2 border border-gray-100 dark:border-gray-700 pointer-events-auto">
                          {MOODS.map(m => (
                            <button 
                              key={m.type} 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateMood(monthYearKey, day, m.type);
                              }}
                              className="w-8 h-8 hover:bg-soft-100 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center text-lg transition-all"
                            >
                              {m.emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-6 md:p-8 bg-soft-100/30 dark:bg-gray-800/30 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100 dark:border-gray-800">
           <div className="flex gap-6">
              <LegendItem color={state.settings.statusColors.done} label="Done" icon={<Check size={10} strokeWidth={4} />} />
              <LegendItem color={state.settings.statusColors.not_done} label="Missed" icon={<X size={10} strokeWidth={4} />} />
              <LegendItem color={state.settings.statusColors.not_applicable} label="N/A" icon={<Minus size={10} strokeWidth={4} />} />
           </div>
           <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/10 transition-transform hover:translate-y-[-2px] active:translate-y-0" style={{ backgroundColor: state.settings.accentColor }}>
             <Plus size={18} /> New Activity
           </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black dark:text-white mb-2">New Habit</h3>
            <p className="text-gray-400 text-sm mb-6">What would you like to track, {state.settings.nickname || 'Tracker'}?</p>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Name</label>
                <input 
                  autoFocus 
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder="Ex: Morning Routine" 
                  className="w-full bg-soft-100 dark:bg-gray-800 p-4 rounded-2xl border-none dark:text-white outline-none ring-2 ring-transparent focus:ring-blue-500/20 text-lg font-bold"
                  onKeyPress={(e: any) => e.key === 'Enter' && handleAddActivity()}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Choose an Icon</label>
                <div className="grid grid-cols-5 gap-3 max-h-40 overflow-y-auto no-scrollbar p-1">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => setNewActivityEmoji(emoji)}
                      className={`w-12 h-12 flex items-center justify-center text-xl rounded-xl transition-all ${
                        newActivityEmoji === emoji 
                          ? 'bg-blue-500 text-white scale-110 shadow-lg' 
                          : 'bg-soft-100 dark:bg-gray-800 hover:bg-soft-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setNewActivityName("");
                  setNewActivityEmoji("🔥");
                }} 
                className="flex-1 py-4 bg-soft-100 dark:bg-gray-800 rounded-2xl font-bold text-gray-500 hover:bg-soft-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddActivity}
                disabled={!newActivityName.trim()}
                className="flex-1 py-4 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50" 
                style={{ backgroundColor: state.settings.accentColor }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{ onClick: () => void, icon: React.ReactNode }> = ({ onClick, icon }) => (
  <button onClick={onClick} className="p-2.5 md:p-3 hover:bg-soft-100 dark:hover:bg-gray-800 text-gray-400 transition-all rounded-xl">
    {icon}
  </button>
);

const LegendItem: React.FC<{ color: string, label: string, icon?: React.ReactNode }> = ({ color, label, icon }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-4.5 h-4.5 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
  </div>
);

export default TrackerView;
