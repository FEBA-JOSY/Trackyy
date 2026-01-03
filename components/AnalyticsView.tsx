
import React, { useState, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { AppState } from '../types';
import { Flame, Trophy, Target, Calendar, BarChart2, PieChart as PieChartIcon, Activity as ActivityIcon } from 'lucide-react';
import { MONTH_NAMES } from '../constants';

type Period = 'weekly' | 'monthly' | 'yearly';

const AnalyticsView: React.FC<{ state: AppState }> = ({ state }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState<Period>('monthly');
  
  const monthKey = `${selectedYear}-${selectedMonth + 1}`;

  const { barData, donutData, overallAvg } = useMemo(() => {
    // Histogram Data
    const barResults = state.activities.map(act => {
      let count = 0;
      let totalExpected = 1;

      if (period === 'monthly') {
        const logs = act.logs[monthKey] || {};
        count = Object.values(logs).filter(s => s === 'done').length;
        totalExpected = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      } else if (period === 'weekly') {
        const now = new Date();
        totalExpected = 7;
        for (let i = 0; i < 7; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const mk = `${d.getFullYear()}-${d.getMonth() + 1}`;
          if (act.logs[mk]?.[d.getDate()] === 'done') count++;
        }
      } else {
        totalExpected = 365;
        Object.keys(act.logs).forEach(mk => {
          if (mk.startsWith(`${selectedYear}-`)) {
            count += Object.values(act.logs[mk]).filter(s => s === 'done').length;
          }
        });
      }
      return { name: act.name, done: count, total: totalExpected };
    });

    // Donut Chart Data & Distribution Percentages
    let done = 0, missed = 0, skipped = 0;
    state.activities.forEach(act => {
      const logs = act.logs[monthKey] || {};
      Object.values(logs).forEach(status => {
        if (status === 'done') done++;
        else if (status === 'not_done') missed++;
        else if (status === 'not_applicable') skipped++;
      });
    });

    const totalLogs = done + missed + skipped;
    const donutResults = [
      { name: 'Completed', value: done, color: state.settings.statusColors.done, percent: totalLogs > 0 ? Math.round((done / totalLogs) * 100) : 0 },
      { name: 'Missed', value: missed, color: state.settings.statusColors.not_done, percent: totalLogs > 0 ? Math.round((missed / totalLogs) * 100) : 0 },
      { name: 'Skipped', value: skipped, color: state.settings.statusColors.not_applicable, percent: totalLogs > 0 ? Math.round((skipped / totalLogs) * 100) : 0 }
    ];

    const avg = barResults.length > 0 
      ? Math.round(barResults.reduce((acc, curr) => acc + (curr.done / curr.total), 0) / barResults.length * 100)
      : 0;

    return { barData: barResults, donutData: donutResults, overallAvg: avg };
  }, [state, period, monthKey, selectedYear, selectedMonth]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black dark:text-white">Deep Insights</h2>
          <p className="text-gray-400 font-medium">Visualization of your journey across {period} performance.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white/50 dark:bg-gray-900/50 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            {(['weekly', 'monthly', 'yearly'] as Period[]).map(p => (
              <button 
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize ${period === p ? 'bg-white dark:bg-gray-800 text-blue-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {p}
              </button>
            ))}
          </div>

          {period === 'monthly' && (
            <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md p-2.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <Calendar size={18} style={{ color: state.settings.accentColor }} />
               <select 
                 value={selectedMonth} 
                 onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                 className="bg-transparent border-none text-sm font-bold dark:text-white focus:ring-0 cursor-pointer"
               >
                 {MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m}</option>)}
               </select>
               <input 
                 type="number" 
                 value={selectedYear} 
                 onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                 className="bg-transparent border-none w-16 text-sm font-bold dark:text-white focus:ring-0"
               />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <BarChart2 style={{ color: state.settings.accentColor }} />
            <h3 className="text-xl font-bold dark:text-white">Activity Histogram</h3>
          </div>
          <div className="h-[350px]">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}} 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', backgroundColor: state.settings.theme === 'dark' ? '#111827' : '#fff' }} 
                  />
                  <Bar dataKey="done" fill={state.settings.accentColor} radius={[8, 8, 0, 0]}>
                    {barData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={state.settings.accentColor} fillOpacity={0.7 + (index % 3) * 0.1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium">No activity data yet</div>
            )}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <PieChartIcon style={{ color: state.settings.accentColor }} />
            <h3 className="text-xl font-bold dark:text-white">Status Distribution</h3>
          </div>
          <div className="h-[280px]">
            {donutData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                    label={false}
                    labelLine={false}
                  >
                    {donutData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={_entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', backgroundColor: state.settings.theme === 'dark' ? '#111827' : '#fff' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium">Track some habits to see distribution</div>
            )}
          </div>

          <div className="mt-8 space-y-4 px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 text-center">Breakdown Out of 100%</p>
            {donutData.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span style={{ color: item.color }}>{item.percent}%</span>
                </div>
                <div className="w-full h-2 bg-soft-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Overall Success" value={`${overallAvg}%`} icon={<Target className="text-emerald-500" />} />
        <StatCard title="Current Streak" value="12 Days" icon={<Flame className="text-orange-500" />} />
        <StatCard title="Achievement" value="Rising Star" icon={<Trophy className="text-yellow-500" />} />
        <StatCard title="Active Habits" value={state.activities.length.toString()} icon={<ActivityIcon className="text-blue-500" />} />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white/80 dark:bg-gray-900/80 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:translate-y-[-2px]">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-soft-100 dark:bg-gray-800 rounded-2xl">{icon}</div>
    </div>
    <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</h4>
    <p className="text-2xl font-black dark:text-white mt-1">{value}</p>
  </div>
);

export default AnalyticsView;
