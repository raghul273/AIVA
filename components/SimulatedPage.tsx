
import React, { useEffect, useState, useRef } from 'react';
import { AccessibilitySettings, SimplifiedContentResponse, WebPageContent, QuizQuestion, ChatMessage } from '../types';
import BrowserHeader from './BrowserHeader';
import { 
  Zap, 
  Sparkles, 
  Brain, 
  Search,
  MessageCircle,
  X,
  Send,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface SimulatedPageProps {
  settings: AccessibilitySettings;
  simplifiedContent: SimplifiedContentResponse | null;
  content: WebPageContent;
  onNavigate: (query: string) => void;
  onBack: () => void;
  canGoBack: boolean;
  isLoading: boolean;
  quiz: QuizQuestion[] | null;
  onToggleSettings: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isChatLoading: boolean;
  isRewriting: boolean;
  apiError: string | null;
}

const SkeletonArticle = ({ highContrast }: { highContrast?: boolean }) => (
  <div className="max-w-4xl mx-auto p-5 sm:p-24 space-y-12 animate-pulse">
    <div className={`h-12 sm:h-16 rounded-3xl w-3/4 mb-16 ${highContrast ? 'bg-[#ffff00]' : 'bg-slate-200 dark:bg-slate-700'}`} />
    <div className="space-y-6">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className={`h-5 rounded-lg ${highContrast ? 'bg-[#ffff00]/40' : 'bg-slate-100 dark:bg-slate-800'}`} 
          style={{ width: `${Math.floor(Math.random() * (100 - 60 + 1) + 60)}%`, animationDuration: '0.8s' }} 
        />
      ))}
    </div>
  </div>
);

const SimulatedPage: React.FC<SimulatedPageProps> = ({ 
  settings, simplifiedContent, content, onNavigate, onBack, canGoBack, isLoading, quiz, onToggleSettings, isDarkMode, toggleTheme, chatMessages, onSendMessage, isChatLoading, isRewriting, apiError
}) => {
  const [mouseY, setMouseY] = useState(0);
  const [homeSearchInput, setHomeSearchInput] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    const updateRulerPos = (y: number) => setMouseY(y);
    const handleMouseMove = (e: MouseEvent) => updateRulerPos(e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        updateRulerPos(e.touches[0].clientY);
      }
    };

    if (settings.readingRuler) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [settings.readingRuler]);

  const isHighContrast = settings.mode === 'high-contrast';
  const isReading = settings.mode === 'reading';
  const isDyslexia = settings.mode === 'dyslexia';
  const isHome = content.title === 'AccessiMod';

  const styleVars = {
    '--bg-color': isHighContrast ? '#000' : isReading ? (isDarkMode ? '#1e293b' : '#fdf6e3') : 'var(--theme-bg)',
    '--text-color': isHighContrast ? '#ffff00' : isReading ? (isDarkMode ? '#e2e8f0' : '#2e2e2e') : 'var(--theme-text)',
    '--font-size': `${settings.fontSize}px`,
    '--font-weight': settings.fontWeight,
    '--line-height': `${settings.lineSpacing}`,
  } as any;

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className={`flex flex-col items-center justify-start min-h-screen transition-all duration-300 w-full overflow-x-hidden ${isDyslexia ? 'p-0 dyslexia-mode' : 'p-0 sm:p-4'}`}>
      <style>{`
        /* --- DYSLEXIA MODE: FLOATING READER CARD --- */
        .dyslexia-mode #simulated-viewport {
          background-color: #1a1a1a !important; 
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
        }

        .dyslexia-mode article,
        .dyslexia-mode #ai-summary-content,
        .dyslexia-mode .quiz-container {
          max-width: 800px !important; 
          width: 90% !important;
          margin: 0 auto 40px auto !important;
          background-color: #FFFDD0 !important; 
          color: #222222 !important;
          padding: 60px !important; 
          border-radius: 24px !important;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6) !important;
          border: none !important;
        }

        /* FIX: Quiz Specific Layout in Dyslexia Mode */
        .dyslexia-mode .quiz-container p,
        .dyslexia-mode .quiz-container h3 {
          color: #222222 !important;
        }

        /* Default option state in Dyslexia Mode */
        .dyslexia-mode .quiz-option {
          background-color: #ffffff !important;
          border: 2px solid #333333 !important;
          color: #333333 !important;
        }

        /* Specificity for Correct/Incorrect states */
        .dyslexia-mode .quiz-option.correct {
          background-color: #10b981 !important;
          border-color: #065f46 !important;
        }
        .dyslexia-mode .quiz-option.correct span {
          color: #ffffff !important;
        }

        .dyslexia-mode .quiz-option.incorrect {
          background-color: #f43f5e !important;
          border-color: #9f1239 !important;
        }
        .dyslexia-mode .quiz-option.incorrect span {
          color: #ffffff !important;
        }

        .dyslexia-mode * { 
          font-family: 'Comic Sans MS', 'Verdana', sans-serif !important; 
          font-weight: 500 !important; 
          line-height: 2.0 !important; 
          letter-spacing: 0.05em !important; 
          word-spacing: 0.15em !important;
          text-align: left !important;
        }

        .dyslexia-mode h1, 
        .dyslexia-mode h2, 
        .dyslexia-mode h3 {
          margin-bottom: 0.6em !important;
          line-height: 1.2 !important;
          color: #000000 !important;
          letter-spacing: 0.02em !important;
        }

        .dyslexia-mode h1 { font-size: 2.5rem !important; }
        .dyslexia-mode h2 { font-size: 1.8rem !important; }

        .dyslexia-mode .browser-window {
          background: #111 !important;
          border: none !important;
        }

        /* --- ADHD FOCUS MODE --- */
        .focus-mode-active #simulated-viewport p, 
        .focus-mode-active #simulated-viewport h1, 
        .focus-mode-active #simulated-viewport h2,
        .focus-mode-active #simulated-viewport h3,
        .focus-mode-active #simulated-viewport h4,
        .focus-mode-active #simulated-viewport h5,
        .focus-mode-active #simulated-viewport h6,
        .focus-mode-active #simulated-viewport li {
          opacity: 0.15; 
          filter: blur(5px); 
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          transform: scale(0.98);
          pointer-events: auto;
        }

        .focus-mode-active #simulated-viewport p:hover, 
        .focus-mode-active #simulated-viewport h1:hover,
        .focus-mode-active #simulated-viewport h2:hover,
        .focus-mode-active #simulated-viewport h3:hover,
        .focus-mode-active #simulated-viewport h4:hover,
        .focus-mode-active #simulated-viewport h5:hover,
        .focus-mode-active #simulated-viewport h6:hover,
        .focus-mode-active #simulated-viewport li:hover {
          opacity: 1 !important; 
          filter: blur(0) !important; 
          transform: scale(1.02) translateX(10px); 
          z-index: 50;
          background: var(--theme-surface);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
          padding: 1.5rem;
          border-radius: 1.5rem;
          border-left: 4px solid var(--theme-accent);
        }

        .high-contrast-mode button { border: 2px solid #ffff00 !important; }
      `}</style>

      <div className={`browser-window w-full max-w-[1400px] flex flex-col rounded-none sm:rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] bg-theme-surface border border-theme-border h-[100vh] sm:h-[94vh] relative transition-all duration-300 ${isDyslexia ? 'max-w-none rounded-none' : ''}`}>
        <BrowserHeader 
          currentTopic={content.title} 
          isLoading={isLoading} 
          canGoBack={canGoBack} 
          onBack={onBack} 
          onNavigate={onNavigate} 
          onHome={() => onNavigate("Home")} 
          onToggleSettings={onToggleSettings} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
        />

        <div 
          id="simulated-viewport" 
          className={`flex-1 overflow-y-auto relative custom-scrollbar min-h-0 ${isDyslexia ? 'dyslexia-mode' : ''}`} 
          style={{ backgroundColor: isDyslexia ? '#1a1a1a' : styleVars['--bg-color'] }}
        >
          {apiError && (
            <div className="sticky top-0 z-[100] w-full px-4 sm:px-8 pt-4 pointer-events-none">
              <div className="pointer-events-auto bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/20 p-4 rounded-3xl flex items-center justify-between shadow-xl shadow-rose-500/5 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500 rounded-xl text-white shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-600 dark:text-rose-400">System Alert</h4>
                    <p className="text-[10px] font-bold text-rose-500/70 uppercase">{apiError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <SkeletonArticle highContrast={isHighContrast} />
          ) : isHome ? (
            <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--theme-accent-soft)_0%,transparent_70%)] opacity-30 pointer-events-none" />
              
              <div className="max-w-3xl w-full space-y-6 sm:space-y-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black tracking-widest uppercase">
                  <Sparkles size={14} /> Accessibility Suite
                </div>

                <h1 className="text-4xl sm:text-7xl font-black mb-4 sm:mb-6 leading-[1.1] sm:leading-[0.9] tracking-tighter">Pure focus, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">zero noise.</span></h1>
                <p className="text-base sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-12 font-medium px-4">Adaptive reading for neurodivergent and low-vision users.</p>
                
                <form onSubmit={(e) => { e.preventDefault(); onNavigate(homeSearchInput); }} className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 p-2 sm:p-3 bg-white dark:bg-slate-800 rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-theme-border group focus-within:border-indigo-500 transition-all">
                  <input type="text" value={homeSearchInput} onChange={(e) => setHomeSearchInput(e.target.value)} className="flex-1 bg-transparent px-6 sm:px-8 py-4 sm:py-5 outline-none font-bold text-base sm:text-lg" placeholder="Search topic..." />
                  <button type="submit" className="bg-indigo-600 text-white px-8 sm:px-10 py-4 sm:py-0 rounded-2xl sm:rounded-full font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Search size={18}/> <span>Go</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-5 sm:p-24 space-y-12 sm:space-y-16">
              {isRewriting && (
                <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-2xl border border-indigo-500/20 flex flex-col items-center animate-in zoom-in-95 duration-300 mx-4">
                    <div className="p-4 bg-indigo-600 rounded-full text-white animate-spin mb-4 shadow-xl shadow-indigo-500/30">
                      <Sparkles size={32} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 text-center">✨ Updating Context...</h3>
                  </div>
                </div>
              )}

              {simplifiedContent && (
                <div id="ai-summary-content" className={`p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(99,102,241,0.3)] relative overflow-hidden group transition-colors ${isHighContrast ? 'bg-black border-4 border-[#ffff00] text-[#ffff00]' : 'bg-indigo-600 text-white'}`}>
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform hidden sm:block">
                    <Sparkles size={140} />
                  </div>
                  <div className="flex items-center gap-2 mb-4 sm:mb-6"><Zap size={20} /><h3 className="font-black uppercase tracking-widest text-[10px]">AI ADAPTIVE SUMMARY</h3></div>
                  <p className="text-2xl sm:text-3xl font-black leading-tight mb-6 sm:mb-8 tracking-tighter">{simplifiedContent.simplifiedText}</p>
                  <div className={`text-base sm:text-lg leading-relaxed font-medium space-y-2 ${isHighContrast ? 'opacity-100' : 'opacity-90'}`} dangerouslySetInnerHTML={{ __html: simplifiedContent.summary.replace(/\n/g, '<br/>') }} />
                </div>
              )}

              <article 
                id="article-content" 
                className={`overflow-visible ${isDyslexia ? 'dyslexia-mode' : ''}`}
                style={{ 
                  color: isDyslexia ? '#222222' : styleVars['--text-color'], 
                  fontSize: isDyslexia ? '1.2rem' : styleVars['--font-size'], 
                  lineHeight: isDyslexia ? '2.0' : styleVars['--line-height'], 
                  fontWeight: isDyslexia ? '500' : styleVars['--font-weight'] 
                }}
              >
                <h1 className="text-3xl sm:text-6xl font-black mb-8 sm:mb-16 leading-[1.1] tracking-tighter">{content.title}</h1>
                <div 
                  id="article-content-body" 
                  dangerouslySetInnerHTML={{ __html: content.contentHtml }} 
                  className="space-y-6 sm:space-y-8 prose-slate dark:prose-invert max-w-none min-h-screen pb-24 article-body" 
                />
              </article>

              {quiz && quiz.length > 0 && (
                <div className={`quiz-container p-6 sm:p-12 rounded-3xl sm:rounded-[3rem] border shadow-inner space-y-8 sm:space-y-12 transition-colors ${isHighContrast ? 'bg-black border-[#ffff00]' : 'bg-slate-50 dark:bg-slate-800/50 border-theme-border'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl shrink-0 ${isHighContrast ? 'bg-[#ffff00] text-black' : 'bg-indigo-600 text-white'}`}><Brain size={24} className="sm:w-7 sm:h-7" /></div>
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-black ${isHighContrast ? 'text-[#ffff00]' : 'text-slate-800 dark:text-slate-100'}`}>Retention Quiz</h3>
                    </div>
                  </div>
                  <div className="space-y-10 sm:space-y-12">
                    {quiz.map((q, idx) => {
                      const selectedIdx = quizAnswers[idx];
                      const isAnswered = selectedIdx !== undefined;

                      return (
                        <div key={idx} className="space-y-4 sm:space-y-6">
                          <p className={`font-black text-lg sm:text-xl leading-tight ${isHighContrast ? 'text-[#ffff00]' : 'text-slate-800 dark:text-slate-100'}`}>{idx + 1}. {q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = oIdx === q.correctAnswerIndex;
                              const isWrongSelection = isAnswered && selectedIdx === oIdx && !isCorrect;
                              const shouldRevealCorrect = isAnswered && isCorrect;

                              // Visual feedback classes
                              let feedbackClass = '';
                              if (shouldRevealCorrect) feedbackClass = 'correct bg-emerald-500 border-emerald-400 text-white';
                              else if (isWrongSelection) feedbackClass = 'incorrect bg-rose-500 border-rose-400 text-white';
                              else if (!isAnswered) feedbackClass = isHighContrast ? 'bg-black border-[#ffff00] text-[#ffff00]' : 'bg-white dark:bg-slate-900 border-transparent hover:border-indigo-500/50 shadow-sm';
                              else feedbackClass = 'opacity-50 grayscale bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400';

                              return (
                                <button 
                                  key={oIdx} 
                                  disabled={isAnswered}
                                  onClick={() => setQuizAnswers(prev => ({...prev, [idx]: oIdx}))} 
                                  className={`quiz-option p-4 sm:p-6 text-left rounded-2xl sm:rounded-[1.5rem] border-2 transition-all font-bold text-base sm:text-lg flex items-center justify-between group ${feedbackClass}`}
                                >
                                  <span>{opt}</span>
                                  {!isAnswered && <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {settings.readingRuler && (
            <div className="fixed left-0 w-full pointer-events-none z-[9999] bg-indigo-500/10 backdrop-blur-[2px] border-y-2 border-indigo-500/20 h-20 shadow-[0_0_80px_rgba(99,102,241,0.1)]" style={{ top: mouseY - 40 }} />
          )}
        </div>

        {/* Floating Chat */}
        {!isHome && (
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] flex flex-col items-end gap-4">
            {isChatOpen && (
              <div className={`w-[calc(100vw-2rem)] sm:w-[380px] h-[450px] sm:h-[520px] rounded-3xl sm:rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.4)] border flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 transition-colors ${isHighContrast ? 'bg-black border-[#ffff00]' : 'bg-theme-surface border-theme-border'}`}>
                <div className={`p-4 sm:p-6 flex items-center justify-between shadow-lg ${isHighContrast ? 'bg-[#ffff00] text-black' : 'bg-indigo-600 text-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isHighContrast ? 'bg-black/10' : 'bg-white/20'}`}><MessageCircle size={18} /></div>
                    <h4 className="font-black text-sm uppercase">Assistant</h4>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-xl"><X size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-sm font-medium shadow-sm ${msg.role === 'user' ? (isHighContrast ? 'bg-[#ffff00] text-black' : 'bg-indigo-600 text-white') : (isHighContrast ? 'bg-black border-2 border-[#ffff00] text-[#ffff00]' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-theme-border')}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border flex gap-1 ${isHighContrast ? 'bg-black border-[#ffff00]' : 'bg-white dark:bg-slate-800 border-theme-border'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isHighContrast ? 'bg-[#ffff00]' : 'bg-indigo-50'}`} />
                        <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${isHighContrast ? 'bg-[#ffff00]' : 'bg-indigo-50'}`} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleChatSubmit} className={`p-3 sm:p-4 border-t flex gap-2 ${isHighContrast ? 'bg-black border-[#ffff00]' : 'bg-white dark:bg-slate-800 border-theme-border'}`}>
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    placeholder="Ask..." 
                    className={`flex-1 px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl outline-none text-sm font-bold ${isHighContrast ? 'bg-black border border-[#ffff00] text-[#ffff00]' : 'bg-slate-100 dark:bg-slate-900'}`}
                  />
                  <button type="submit" className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${isHighContrast ? 'bg-[#ffff00] text-black' : 'bg-indigo-600 text-white'}`}>
                    <Send size={18} className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </form>
              </div>
            )}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)} 
              className={`floating-chat-trigger p-4 sm:p-5 rounded-full shadow-2xl transition-all active:scale-90 flex items-center justify-center ${isChatOpen ? 'bg-rose-500 text-white' : (isHighContrast ? 'bg-[#ffff00] text-black shadow-[#ffff00]/20' : 'bg-indigo-600 text-white hover:bg-indigo-700')}`}
            >
              {isChatOpen ? <X size={24} className="sm:w-7 sm:h-7" /> : <MessageCircle size={24} className="sm:w-7 sm:h-7" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulatedPage;
