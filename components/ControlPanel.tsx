
import React from 'react';
import { AccessibilityMode, AccessibilitySettings } from '../types';
import { 
  Type, 
  Zap, 
  BookOpen, 
  Volume2, 
  Monitor, 
  Sun,
  Sparkles,
  Brain,
  ChevronRight,
  Target,
  X,
  Settings
} from 'lucide-react';

interface ControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onSpeak: () => void;
  isSpeaking: boolean;
  onSimplify: () => void;
  isSimplifying: boolean;
  onGenerateQuiz: () => void;
  isGeneratingQuiz: boolean;
  isHome: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isOpen, onClose, settings, updateSettings, onSpeak, isSpeaking,
  onSimplify, isSimplifying, onGenerateQuiz, isGeneratingQuiz, isHome
}) => {
  if (!isOpen) return null;

  const profiles: { id: AccessibilityMode; label: string; icon: React.ReactNode }[] = [
    { id: 'default', label: 'Default', icon: <Monitor size={16} /> },
    { id: 'dyslexia', label: 'Dyslexia', icon: <Type size={16} /> },
    { id: 'adhd', label: 'ADHD', icon: <Zap size={16} /> },
    { id: 'high-contrast', label: 'Contrast', icon: <Sun size={16} /> },
    { id: 'reading', label: 'Reader', icon: <BookOpen size={16} /> },
  ];

  const complexityLabels: Record<number, string> = {
    1: '👶 Simple',
    2: '📄 Original',
    3: '🎓 Expert'
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[65] sm:hidden" onClick={onClose} />
      
      <div className="fixed bottom-4 left-4 right-4 sm:bottom-auto sm:left-auto sm:right-6 sm:top-24 w-auto sm:w-[340px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/40 dark:border-slate-800/40 z-[70] flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 fade-in max-h-[85vh] sm:max-h-[75vh]">
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Sparkles size={12} /> Accessibility Hub
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all active:scale-95">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          {/* Content Complexity Slider */}
          <section className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1 flex items-center gap-2">
              <Settings size={12} /> Content Complexity
            </label>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-theme-border">
              <div className="flex justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${settings.complexityLevel === 1 ? 'text-indigo-500' : 'text-slate-400'}`}>Simple</span>
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${settings.complexityLevel === 2 ? 'text-indigo-500' : 'text-slate-400'}`}>Original</span>
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${settings.complexityLevel === 3 ? 'text-indigo-500' : 'text-slate-400'}`}>Expert</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="1"
                value={settings.complexityLevel} 
                onChange={(e) => updateSettings({ complexityLevel: Number(e.target.value) })} 
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600 mb-2"
              />
              <p className="text-center text-sm font-black text-indigo-500 mt-2">
                {complexityLabels[settings.complexityLevel]}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Visibility Profiles</label>
            
            <button onClick={() => updateSettings({ readerMode: !settings.readerMode })} className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${settings.readerMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white dark:bg-slate-800 border-indigo-500/10 text-slate-700 dark:text-slate-300'}`}>
              <div className="flex items-center gap-3">
                <BookOpen size={20} />
                <div className="text-left">
                  <span className="text-sm font-black block">📖 Reader View</span>
                  <span className="text-[10px] opacity-60">Strip ads & clutter</span>
                </div>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.readerMode ? 'bg-white/30' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${settings.readerMode ? 'left-4' : 'left-1'}`} />
              </div>
            </button>

            <button onClick={() => updateSettings({ focusMode: !settings.focusMode })} className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${settings.focusMode ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-white dark:bg-slate-800 border-emerald-500/10 text-slate-700 dark:text-slate-300'}`}>
              <div className="flex items-center gap-3">
                <Target size={20} />
                <div className="text-left">
                  <span className="text-sm font-black block">🎯 Focus Mode</span>
                  <span className="text-[10px] opacity-60">Block distractions</span>
                </div>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.focusMode ? 'bg-white/30' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${settings.focusMode ? 'left-4' : 'left-1'}`} />
              </div>
            </button>
          </section>

          <section>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4 px-1">Profiles</label>
            <div className="grid grid-cols-5 gap-2">
              {profiles.map((m) => (
                <button key={m.id} onClick={() => updateSettings({ mode: m.id })} className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all ${settings.mode === m.id ? 'bg-indigo-600 text-white' : 'bg-slate-100/50 dark:bg-slate-800 text-slate-500'}`}>
                  {m.icon}<span className="text-[9px] font-bold">{m.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4 pt-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Text Size</span>
              <span className="text-[10px] font-bold text-indigo-500">{settings.fontSize}px</span>
            </div>
            <input type="range" min="14" max="36" value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })} className="w-full accent-indigo-600 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" />
          </section>

          <section className="space-y-3">
            <button disabled={isHome || isSimplifying} onClick={onSimplify} className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${isHome || isSimplifying ? 'opacity-30' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'}`}>
              <div className="flex items-center gap-3">
                <Zap size={18} /> 
                <span className="text-sm font-black">{isSimplifying ? 'Analyzing...' : 'AI Smart Focus'}</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button disabled={isHome || isGeneratingQuiz} onClick={onGenerateQuiz} className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${isHome || isGeneratingQuiz ? 'opacity-30' : 'bg-white dark:bg-slate-900 border-indigo-500/10 text-slate-700 dark:text-slate-200'}`}>
              <div className="flex items-center gap-3">
                <Brain size={18} /> 
                <span className="text-sm font-black">{isGeneratingQuiz ? 'Generating...' : 'Knowledge Quiz'}</span>
              </div>
            </button>
          </section>

          <button onClick={onSpeak} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all w-full ${isSpeaking ? 'bg-indigo-600 text-white' : 'bg-slate-100/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            <Volume2 size={24} />
            <span className="text-[9px] font-black uppercase">{isSpeaking ? 'Stop' : 'Read Aloud'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
