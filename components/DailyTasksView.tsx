
import React, { useState } from 'react';
import { 
  Plus, Trash2, CheckCircle, Circle, ChevronLeft, ChevronRight,
  ListTodo, CalendarDays, Rocket
} from 'lucide-react';
import { AppState, Task } from '../types';
import { MONTH_NAMES } from '../constants';

interface Props {
  state: AppState;
  updateTasks: (monthYear: string, day: number, tasks: Task[]) => void;
}

const DailyTasksView: React.FC<Props> = ({ state, updateTasks }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskText, setNewTaskText] = useState("");

  const day = selectedDate.getDate();
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  const monthYearKey = `${year}-${month + 1}`;
  
  const tasks = state.tasks[monthYearKey]?.[day] || [];

  const changeDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + days);
    setSelectedDate(next);
  };

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText.trim(),
      completed: false
    };
    updateTasks(monthYearKey, day, [...tasks, newTask]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    updateTasks(monthYearKey, day, updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    updateTasks(monthYearKey, day, updated);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Date Selector Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black dark:text-white flex items-center gap-4">
            Today's Mission
          </h2>
          <p className="text-gray-400 font-medium">Clear your mind by clearing your list.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <button onClick={() => changeDate(-1)} className="p-2.5 hover:bg-soft-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 flex items-center gap-3">
            <CalendarDays size={18} style={{ color: state.settings.accentColor }} />
            <span className="font-black text-sm dark:text-white whitespace-nowrap">
              {MONTH_NAMES[month]} {day}, {year}
            </span>
          </div>
          <button onClick={() => changeDate(1)} className="p-2.5 hover:bg-soft-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Management Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-soft-100 dark:bg-gray-800 rounded-2xl text-gray-400">
                  <ListTodo size={24} />
                </div>
                <h3 className="text-2xl font-black dark:text-white">Active List</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-soft-50 dark:bg-gray-800 px-3 py-1 rounded-lg">
                {tasks.length} items
              </span>
            </div>

            <div className="flex-1 space-y-3">
              {tasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30 grayscale">
                  <Rocket size={60} className="mb-4 text-gray-300" />
                  <p className="font-bold dark:text-gray-500">No tasks for this day yet.<br/>Start fresh and dominate!</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all group ${
                      task.completed 
                        ? 'bg-soft-50 dark:bg-gray-800/20 border-transparent opacity-60' 
                        : 'bg-white dark:bg-gray-900 border-gray-50 dark:border-gray-800 hover:border-blue-500/20 shadow-sm'
                    }`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="transition-transform active:scale-90"
                      style={{ color: task.completed ? state.settings.accentColor : '#94a3b8' }}
                    >
                      {task.completed ? <CheckCircle size={24} fill={`${state.settings.accentColor}22`} /> : <Circle size={24} />}
                    </button>
                    <span className={`flex-1 font-bold dark:text-gray-200 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.text}
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addTask} className="mt-8 flex gap-3">
              <input 
                type="text"
                placeholder="What needs to be done?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 bg-soft-100 dark:bg-gray-800 p-5 rounded-[2rem] border-none outline-none dark:text-white font-bold text-lg focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
              />
              <button 
                type="submit"
                disabled={!newTaskText.trim()}
                className="w-16 h-16 flex items-center justify-center rounded-full text-white shadow-xl shadow-blue-500/10 transition-transform active:scale-90 disabled:opacity-50"
                style={{ backgroundColor: state.settings.accentColor }}
              >
                <Plus size={32} strokeWidth={3} />
              </button>
            </form>
          </div>
        </div>

        {/* Daily Stats Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5">
            <h3 className="text-xl font-black dark:text-white mb-6">Execution Status</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Progress</span>
              <span className="text-xl font-black" style={{ color: state.settings.accentColor }}>{progress}%</span>
            </div>
            <div className="w-full h-4 bg-soft-100 dark:bg-gray-800 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, backgroundColor: state.settings.accentColor }}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-soft-50 dark:bg-gray-800/50 rounded-2xl">
                <span className="text-sm font-bold text-gray-400">Completed</span>
                <span className="font-black dark:text-white">{completedCount}</span>
              </div>
              <div className="flex justify-between p-4 bg-soft-50 dark:bg-gray-800/50 rounded-2xl">
                <span className="text-sm font-bold text-gray-400">Remaining</span>
                <span className="font-black dark:text-white">{tasks.length - completedCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">Focus Day</h3>
              <p className="text-white/70 text-sm font-medium leading-relaxed">
                Small tasks lead to big dreams. Crush your list today to unlock a better version of yourself tomorrow.
              </p>
            </div>
            <Rocket size={100} className="absolute -bottom-4 -right-4 opacity-10 rotate-[15deg]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTasksView;
