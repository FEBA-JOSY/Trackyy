
import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Save, Calendar, Quote, PenTool
} from 'lucide-react';
import { AppState } from '../types';
import { MONTH_NAMES } from '../constants';

interface Props {
  state: AppState;
  updateJournal: (monthYear: string, content: string) => void;
}

const JournalView: React.FC<Props> = ({ state, updateJournal }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthKey = `${selectedYear}-${selectedMonth + 1}`;
  const journalContent = state.journals[monthKey]?.content || "";

  const handleMonthChange = (direction: number) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black dark:text-white">Monthly Reflection</h2>
          <p className="text-gray-400 font-medium">One space for your achievements, thoughts, and growth.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-soft-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 flex items-center gap-2">
            <Calendar size={16} style={{ color: state.settings.accentColor }} />
            <span className="font-black text-sm dark:text-white whitespace-nowrap">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
          </div>
          <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-soft-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Unified Journal Note */}
      <div className="relative bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl dark:shadow-none min-h-[500px] flex flex-col transition-colors duration-500">
        {/* Visual Decorations for Notepad feel */}
        <div className="absolute top-8 right-8 text-gray-100/50 dark:text-gray-800/20 select-none pointer-events-none">
          <PenTool size={120} />
        </div>
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-soft-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <Quote size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black dark:text-white">The Monthly Archive</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Personal Reflections & Key Achievements</p>
          </div>
        </div>

        <textarea
          value={journalContent}
          onChange={(e) => updateJournal(monthKey, e.target.value)}
          placeholder={`Use this space to document your key achievements for ${MONTH_NAMES[selectedMonth]} and reflect on your habit journey...`}
          className="flex-1 w-full bg-transparent border-none outline-none resize-none dark:text-white leading-[2.5rem] text-xl font-medium placeholder:text-gray-200 dark:placeholder:text-gray-700 relative z-10"
          style={{ 
            backgroundImage: 'linear-gradient(transparent, transparent 39px, rgba(0,0,0,0.03) 39px)', 
            backgroundSize: '100% 40px',
            lineHeight: '40px'
          }}
        />

        <div className="mt-8 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-8 relative z-10">
          <div className="flex items-center gap-2 text-gray-300 dark:text-gray-600">
            <Save size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Autosaved to your local vault</span>
          </div>
          <div className="flex gap-1">
             <div className="w-8 h-1 rounded-full bg-blue-500/20" />
             <div className="w-4 h-1 rounded-full bg-blue-500/20" />
             <div className="w-2 h-1 rounded-full bg-blue-500/20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalView;
