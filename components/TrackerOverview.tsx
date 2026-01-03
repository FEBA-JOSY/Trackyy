
import React from 'react';
import { AppState } from '../types';
import { MONTH_NAMES } from '../constants';
import { Calendar, Trophy, ArrowRight, Award, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  state: AppState;
  onSelectMonth: (d: Date) => void;
}

const TrackerOverview: React.FC<Props> = ({ state, onSelectMonth }) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const trackedMonths = new Set<string>();
  state.activities.forEach(act => {
    Object.keys(act.logs).forEach(mk => trackedMonths.add(mk));
  });

  const nowKey = `${currentYear}-${new Date().getMonth() + 1}`;
  trackedMonths.add(nowKey);

  const sortedMonths = Array.from(trackedMonths).sort((a, b) => {
    const [y1, m1] = a.split('-').map(Number);
    const [y2, m2] = b.split('-').map(Number);
    return y2 !== y1 ? y2 - y1 : m2 - m1;
  });

  const getTrophy = (rate: number) => {
    if (rate >= 90) return { label: 'Diamond Legend', icon: <Crown size={28} />, color: '#7dd3fc', bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-600 dark:text-sky-400' };
    if (rate >= 75) return { label: 'Golden Master', icon: <Trophy size={28} />, color: '#fcd34d', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' };
    if (rate >= 50) return { label: 'Silver Achiever', icon: <Award size={28} />, color: '#cbd5e1', bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-600 dark:text-slate-400' };
    if (rate >= 25) return { label: 'Bronze Starter', icon: <Star size={28} />, color: '#d97706', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Rising Participant', icon: <Calendar size={28} />, color: '#94a3b8', bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-500' };
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div>
        <h2 className="text-4xl font-black dark:text-white">Tracker Hall of Fame</h2>
        <p className="text-gray-400 font-medium">Review your monthly achievements and trophy collection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedMonths.map(mk => {
          const [y, m] = mk.split('-').map(Number);
          const monthName = MONTH_NAMES[m - 1];
          
          let done = 0, total = 0;
          state.activities.forEach(act => {
            const logs = act.logs[mk] || {};
            const daysInMonth = new Date(y, m, 0).getDate();
            total += daysInMonth;
            Object.values(logs).forEach(s => {
              if (s === 'done') done++;
            });
          });
          const rate = total === 0 ? 0 : Math.round((done / total) * 100);
          const trophy = getTrophy(rate);

          return (
            <div 
              key={mk}
              onClick={() => { onSelectMonth(new Date(y, m - 1, 1)); navigate('/'); }}
              className="bg-white/90 dark:bg-gray-900/90 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:translate-y-[-6px] transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all group-hover:opacity-40`} style={{ backgroundColor: trophy.color }} />

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`p-5 ${trophy.bg} rounded-3xl group-hover:scale-110 transition-transform shadow-sm`} style={{ color: trophy.color }}>
                  {trophy.icon}
                </div>
                <div className={`${trophy.bg} ${trophy.text} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                  {trophy.label}
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-black dark:text-white mb-1">{monthName}</h3>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">{y}</p>

                <div className="space-y-4 mb-8">
                  <div className="w-full h-3.5 bg-soft-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${rate}%`, backgroundColor: trophy.color }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    <span>Performance</span>
                    <span className={trophy.text}>{rate}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex -space-x-2">
                    {state.activities.slice(0, 3).map(a => (
                      <div key={a.id} className="w-8 h-8 rounded-full bg-soft-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs shadow-sm">
                        {a.emoji}
                      </div>
                    ))}
                    {state.activities.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-soft-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[8px] font-bold text-gray-400 shadow-sm">
                        +{state.activities.length - 3}
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${trophy.text} transition-all group-hover:translate-x-1`}>
                    Dive In <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackerOverview;
