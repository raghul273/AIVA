
import React, { useState, useEffect, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import SimulatedPage from './components/SimulatedPage';
import { AccessibilitySettings, SimplifiedContentResponse, WebPageContent, QuizQuestion, ChatMessage } from './types';
import { simplifyContent, generatePageContent, generateQuiz, askPageQuestion, rewriteContent } from './services/geminiService';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return false;
  });

  const [settings, setSettings] = useState<AccessibilitySettings>({
    mode: 'default',
    fontSize: 18,
    fontWeight: 400,
    lineSpacing: 1.6,
    letterSpacing: 0,
    fontFamily: 'Inter, system-ui, sans-serif',
    showImages: true,
    highlightLinks: false,
    stopAnimations: false,
    hideSidebar: false,
    focusMode: false,
    readerMode: false,
    complexityLevel: 2,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [simplifiedContent, setSimplifiedContent] = useState<SimplifiedContentResponse | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [history, setHistory] = useState<WebPageContent[]>([]);
  const [pageContent, setPageContent] = useState<WebPageContent>({ title: "AccessiMod", contentHtml: "" });
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Cache and History Refs
  const pageCache = useRef<Map<string, WebPageContent>>(new Map());
  const [speechQueue, setSpeechQueue] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const complexityCache = useRef<Record<number, string>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const isHome = pageContent.title === 'AccessiMod';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => setApiError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  /**
   * Sequential Playback Logic
   * Reads one sentence, and on end, moves to the next.
   */
  const speakSentence = (index: number, queue: string[]) => {
    if (index >= queue.length) {
      setIsSpeaking(false);
      setCurrentSentenceIndex(-1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(queue[index]);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setCurrentSentenceIndex(index);
    };

    utterance.onend = () => {
      speakSentence(index + 1, queue);
    };

    utterance.onerror = (e) => {
      console.error("Speech error", e);
      setIsSpeaking(false);
      setCurrentSentenceIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSentenceIndex(-1);
      return;
    }

    const articleEl = document.getElementById('article-content-body');
    const summaryEl = document.getElementById('ai-summary-content');
    
    let textToRead = "";
    
    // Prioritize or include AI summary if visible
    if (summaryEl) {
      textToRead += "AI Summary: " + summaryEl.innerText + ". ";
    }
    
    if (articleEl) {
      textToRead += articleEl.innerText;
    }

    if (!textToRead.trim()) {
      textToRead = isHome ? "Welcome to AccessiMod. Enter a topic to begin." : "";
    }
    
    if (!textToRead.trim()) return;

    // Split text into sentences using regex to create the queue
    const sentences = textToRead
      .match(/[^.!?]+[.!?]+/g)
      ?.map(s => s.trim())
      .filter(s => s.length > 0) || [textToRead.trim()];

    if (sentences.length > 0) {
      setIsSpeaking(true);
      setSpeechQueue(sentences);
      window.speechSynthesis.cancel(); // Clear any pending speech
      speakSentence(0, sentences);
    }
  };

  const updateSettings = async (newSettings: Partial<AccessibilitySettings>) => {
    if ('complexityLevel' in newSettings && newSettings.complexityLevel !== settings.complexityLevel) {
      const level = newSettings.complexityLevel!;
      if (complexityCache.current[level]) {
        setPageContent(prev => ({ ...prev, contentHtml: complexityCache.current[level] }));
        setSettings(prev => ({ ...prev, complexityLevel: level }));
      } else if (!isHome) {
        setIsRewriting(true);
        setApiError(null);
        const originalText = complexityCache.current[2] || pageContent.contentHtml;
        const result = await rewriteContent(originalText, level);
        if (result === "QUOTA_EXCEEDED") {
          setApiError("AI Limit Reached");
        } else {
          complexityCache.current[level] = result;
          setPageContent(prev => ({ ...prev, contentHtml: result }));
          setSettings(prev => ({ ...prev, complexityLevel: level }));
        }
        setIsRewriting(false);
      } else {
        setSettings(prev => ({ ...prev, complexityLevel: level }));
      }
      return;
    }

    setSettings(prev => {
      const next = { ...prev, ...newSettings };
      if (newSettings.mode) {
        if (newSettings.mode === 'reading') {
          next.readerMode = true;
          if (isHome) setTimeout(() => handleNavigate("Latest Accessibility News"), 100);
        } else if (newSettings.mode === 'dyslexia') {
          next.readerMode = true; // Auto-activate reader layout for Dyslexia Mode
        } else {
          next.focusMode = newSettings.mode === 'adhd';
        }
        
        switch (newSettings.mode) {
          case 'dyslexia': 
            next.lineSpacing = 2.0; 
            next.fontWeight = 500; 
            next.letterSpacing = 0.05;
            break;
          case 'adhd': 
            next.lineSpacing = 1.8; 
            next.fontSize = 20; 
            next.stopAnimations = true; 
            next.focusMode = true; 
            break;
          case 'high-contrast': 
            next.fontSize = 22; 
            next.fontWeight = 700; 
            next.highlightLinks = true; 
            break;
          case 'default': 
            next.fontSize = 18; 
            next.fontWeight = 400; 
            next.lineSpacing = 1.6; 
            next.highlightLinks = false; 
            next.focusMode = false; 
            next.readerMode = false;
            break;
        }
      }
      return next;
    });
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);
    setApiError(null);
    const context = document.getElementById('article-content-body')?.innerText || "";
    const responseText = await askPageQuestion(context, text);
    setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsChatLoading(false);
  };

  const handleSimplify = async () => {
    if (simplifiedContent) { setSimplifiedContent(null); return; }
    const articleEl = document.getElementById('article-content-body');
    if (!articleEl?.innerText) return;
    setIsSimplifying(true);
    setApiError(null);
    try {
      const result = await simplifyContent(articleEl.innerText);
      if (result === "QUOTA_EXCEEDED") setApiError("AI Limit Reached");
      else setSimplifiedContent(result as SimplifiedContentResponse);
    } finally { setIsSimplifying(false); }
  };

  const handleGenerateQuiz = async () => {
    if (quiz) { setQuiz(null); return; }
    const articleEl = document.getElementById('article-content-body');
    if (!articleEl?.innerText) return;
    setIsGeneratingQuiz(true);
    setApiError(null);
    try {
      const result = await generateQuiz(articleEl.innerText);
      if (result === "QUOTA_EXCEEDED") setApiError("AI Limit Reached");
      else setQuiz(result as QuizQuestion[]);
    } finally { setIsGeneratingQuiz(false); }
  };

  const handleNavigate = async (query: string) => {
    const q = query.trim();
    if (!q || q === "Home" || q.toLowerCase() === "accessimod") {
      setPageContent({ title: "AccessiMod", contentHtml: "" });
      complexityCache.current = {};
      setChatMessages([]);
      setSimplifiedContent(null);
      setQuiz(null);
      setSettings(prev => ({ ...prev, focusMode: false, readerMode: false, mode: 'default', complexityLevel: 2 }));
      return;
    }

    const normalizedQ = q.toLowerCase();
    
    // Check Cache first for instant loading
    if (pageCache.current.has(normalizedQ)) {
      const cachedPage = pageCache.current.get(normalizedQ)!;
      if (pageContent.title !== 'AccessiMod') setHistory(prev => [...prev, pageContent]);
      setPageContent(cachedPage);
      complexityCache.current = { 2: cachedPage.contentHtml };
      setChatMessages([]);
      setSimplifiedContent(null);
      setQuiz(null);
      setApiError(null);
      setSettings(prev => ({ ...prev, complexityLevel: 2 }));
      return;
    }

    if (pageContent.title !== 'AccessiMod') setHistory(prev => [...prev, pageContent]);
    setIsLoadingPage(true);
    setChatMessages([]);
    setSimplifiedContent(null);
    setQuiz(null);
    setApiError(null);
    complexityCache.current = {}; 
    try {
      const content = await generatePageContent(q);
      if (content === "QUOTA_EXCEEDED") setApiError("AI Limit Reached");
      else {
        const data = content as WebPageContent;
        setPageContent(data);
        pageCache.current.set(normalizedQ, data);
        complexityCache.current[2] = data.contentHtml;
        setSettings(prev => ({ ...prev, complexityLevel: 2 }));
      }
    } finally { setIsLoadingPage(false); }
  };

  const handleBack = () => {
    if (history.length === 0) { if (!isHome) handleNavigate("Home"); return; }
    const newHistory = [...history];
    const prev = newHistory.pop();
    if (prev) { 
      setHistory(newHistory); 
      setPageContent(prev); 
      setChatMessages([]); 
      setSimplifiedContent(null); 
      setQuiz(null);
      setApiError(null);
      complexityCache.current = { 2: prev.contentHtml };
      setSettings(prevSet => ({ ...prevSet, complexityLevel: 2 }));
    }
  };

  const wrapperClasses = [
    "relative font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors min-h-screen",
    settings.mode === 'dyslexia' ? 'dyslexia-mode' : '',
    settings.focusMode ? 'focus-mode-active' : '',
    settings.mode === 'high-contrast' ? 'high-contrast-mode' : ''
  ].join(' ');

  return (
    <div className={wrapperClasses}>
      <ControlPanel 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} updateSettings={updateSettings}
        onSpeak={handleSpeak} isSpeaking={isSpeaking}
        onSimplify={handleSimplify} isSimplifying={isSimplifying}
        onGenerateQuiz={handleGenerateQuiz} isGeneratingQuiz={isGeneratingQuiz}
        isHome={isHome}
      />
      <SimulatedPage 
        settings={settings} simplifiedContent={simplifiedContent}
        content={pageContent} onNavigate={handleNavigate}
        onBack={handleBack} canGoBack={!isHome}
        isLoading={isLoadingPage} quiz={quiz}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isDarkMode={isDarkMode} toggleTheme={toggleTheme}
        chatMessages={chatMessages} onSendMessage={handleSendMessage}
        isChatLoading={isChatLoading}
        isRewriting={isRewriting}
        apiError={apiError}
      />
    </div>
  );
};

export default App;
