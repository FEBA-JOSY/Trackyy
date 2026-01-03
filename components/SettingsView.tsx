
import React from 'react';
import { UserSettings } from '../types';
import { Palette, Type, Sliders, RefreshCw, Check, UserCircle } from 'lucide-react';

interface Props {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
}

const SettingsView: React.FC<Props> = ({ settings, updateSettings }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-right-4 duration-700 pb-20">
      <div>
        <h2 className="text-4xl font-black dark:text-white">Design Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Make your workspace feel like home.</p>
      </div>

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-3">
          <UserCircle size={22} style={{ color: settings.accentColor }} /> Profile
        </h3>
        <p className="text-sm text-gray-500 mb-6">How you'll be greeted throughout the app.</p>
        <div className="space-y-3">
           <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nickname</label>
           <input 
             type="text" 
             value={settings.nickname} 
             onChange={(e) => updateSettings({ nickname: e.target.value })}
             placeholder="Your nickname"
             className="w-full bg-soft-100 dark:bg-gray-800 p-5 rounded-2xl border-none focus:ring-2 focus:ring-blue-500/20 dark:text-white outline-none font-bold"
           />
        </div>
      </section>

      {/* Interface Theme Color */}
      <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-3">
          <Palette size={22} style={{ color: settings.accentColor }} /> Main Color Theme
        </h3>
        <p className="text-sm text-gray-500 mb-6">Choose the main color for your buttons, icons, and highlights.</p>
        <div className="flex flex-wrap gap-4">
          {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'].map(color => (
            <button
              key={color}
              onClick={() => updateSettings({ accentColor: color })}
              className={`w-12 h-12 rounded-2xl border-4 transition-all flex items-center justify-center ${settings.accentColor === color ? 'border-gray-200 dark:border-gray-700' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: color }}
            >
              {settings.accentColor === color && <Check className="text-white" size={20} />}
            </button>
          ))}
          <input 
            type="color" 
            value={settings.accentColor} 
            onChange={(e) => updateSettings({ accentColor: e.target.value })}
            className="w-12 h-12 rounded-2xl border-none outline-none cursor-pointer bg-gray-100 dark:bg-gray-800"
          />
        </div>
      </section>

      {/* Status Colors - Simple Mapping */}
      <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-xl font-bold dark:text-white mb-8 flex items-center gap-3">
          <Sliders size={22} className="text-emerald-500" /> Goal Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
             <label className="text-xs font-black uppercase tracking-widest text-gray-400">Done Color</label>
             <input 
               type="color" 
               value={settings.statusColors.done} 
               onChange={(e) => updateSettings({ statusColors: { ...settings.statusColors, done: e.target.value } })}
               className="w-full h-12 rounded-xl cursor-pointer border-none outline-none"
             />
          </div>
          <div className="space-y-3">
             <label className="text-xs font-black uppercase tracking-widest text-gray-400">Missed Color</label>
             <input 
               type="color" 
               value={settings.statusColors.not_done} 
               onChange={(e) => updateSettings({ statusColors: { ...settings.statusColors, not_done: e.target.value } })}
               className="w-full h-12 rounded-xl cursor-pointer border-none outline-none"
             />
          </div>
          <div className="space-y-3">
             <label className="text-xs font-black uppercase tracking-widest text-gray-400">Skipped Color</label>
             <input 
               type="color" 
               value={settings.statusColors.not_applicable} 
               onChange={(e) => updateSettings({ statusColors: { ...settings.statusColors, not_applicable: e.target.value } })}
               className="w-full h-12 rounded-xl cursor-pointer border-none outline-none"
             />
          </div>
        </div>
      </section>

      {/* Font Family Selection */}
      <section className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-3">
          <Type size={22} className="text-purple-500" /> Text Style
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'Inter', label: 'Modern', class: 'font-sans' },
            { id: 'Outfit', label: 'Friendly', class: 'font-outfit' },
            { id: 'Serif', label: 'Classic', class: 'font-serif' },
            { id: 'Mono', label: 'Clean', class: 'font-mono' }
          ].map(font => (
            <button
              key={font.id}
              onClick={() => updateSettings({ fontFamily: font.id as any })}
              className={`p-6 rounded-2xl border-2 transition-all text-center ${
                settings.fontFamily === font.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
              }`}
            >
              <span className={`text-2xl block mb-2 ${font.class}`}>Aa</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{font.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Reset Section */}
      <div className="flex justify-center pt-10">
        <button 
          // Fixed the key to trackyy_master_v1 to match STORAGE_KEY in App.tsx
          onClick={() => confirm("Wipe all data?") && (localStorage.removeItem('trackyy_master_v1'), window.location.reload())}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold transition-colors"
        >
          <RefreshCw size={18} /> Delete My Progress
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
