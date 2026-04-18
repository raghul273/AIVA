
import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  RotateCw, 
  Settings2, 
  Type,
  Sun,
  Moon
} from 'lucide-react';

interface BrowserHeaderProps {
  currentTopic: string;
  isLoading: boolean;
  canGoBack: boolean;
  onBack: () => void;
  onNavigate: (query: string) => void;
  onHome: () => void;
  onToggleSettings: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const BrowserHeader: React.FC<BrowserHeaderProps> = ({
  currentTopic,
  isLoading,
  canGoBack,
  onBack,
  onHome,
  onToggleSettings,
  isDarkMode,
  toggleTheme
}) => {
  return (
    <div className="sticky top-0 z-[60] w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-3">
      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }} />
      )}
      <style>{`
        @keyframes loading {
          0% { left: -30%; width: 30%; }
          50% { left: 40%; width: 20%; }
          100% { left: 100%; width: 30%; }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onBack}
            disabled={!canGoBack}
            title="Go back"
            className={`p-2 rounded-xl transition-all ${canGoBack ? 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <button 
            disabled 
            className="p-2 rounded-xl text-slate-300 dark:text-slate-600 cursor-not-allowed"
          >
            <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => {
              const article = document.getElementById('simulated-viewport');
              if (article) article.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="Reload content"
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-all"
          >
            <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={onHome}
            title="Go home"
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-all ml-1"
          >
            <Home size={18} />
          </button>
          
          {/* Current Page Indicator */}
          {!isLoading && currentTopic !== 'AccessiMod' && (
            <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {currentTopic}
              </span>
            </div>
          )}
        </div>

        {/* Accessibility & Theme Toggles */}
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-all border border-slate-200/30 dark:border-slate-700/30 shadow-sm"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={onToggleSettings}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-all border border-indigo-200/30 dark:border-indigo-500/20 group shadow-sm active:scale-95"
          >
            <Type size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold tracking-tight hidden sm:block">Accessibility Hub</span>
            <Settings2 size={16} className="opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrowserHeader;
