
export type AccessibilityMode = 'default' | 'dyslexia' | 'adhd' | 'high-contrast' | 'reading';

export interface AccessibilitySettings {
  mode: AccessibilityMode;
  fontSize: number;
  fontWeight: number;
  lineSpacing: number;
  letterSpacing: number;
  fontFamily: string;
  showImages: boolean;
  highlightLinks: boolean;
  stopAnimations: boolean;
  hideSidebar: boolean;
  focusMode: boolean;
  readerMode: boolean;
  complexityLevel: number; // 1: Simple, 2: Original, 3: Expert
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SimplifiedContentResponse {
  summary: string;
  simplifiedText: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface WebPageContent {
  title: string;
  contentHtml: string;
  sources?: { title: string; uri: string }[];
}