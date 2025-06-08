
import React from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

export interface BaseMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatMessage extends BaseMessage {
  language?: string; // Language code (e.g., 'en', 'hi') for general chatbot
}

export interface DocumentAnalysisMessage extends BaseMessage {
  // No specific language field here, context is image + text
  isSummary?: boolean; // Flag to identify if this message is the initial summary
}


export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

// New types for Learn section
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string; // Optional explanation shown after answering
}

export interface Lesson {
  id: string;
  title: string;
  content: React.ReactNode; // Can be simple text, JSX, or markdown parsed content
  read?: boolean; // Optional: to track read status, though primarily managed in localStorage
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
  icon?: React.ElementType; // Icon for the module card
  coverImage?: string; // Optional image for the module card
}

export interface UploadedFile {
  name: string;
  type: string; // e.g., 'image/png', 'image/jpeg'
  size: number; // File size in bytes
  objectURL?: string; // For previewing the image easily
}

// Types for Progress Tracking
export interface QuizScoreData {
  score: number;
  total: number;
  percentage: number;
  lastAttempt: number; // Timestamp
}

export interface UserProgress {
  readLessons: string[]; // Array of "moduleId_lessonId" strings
  quizScores: Record<string, QuizScoreData>; // Keyed by moduleId
}

export interface AllUserProgress {
  [userId: string]: UserProgress;
}

// Types for Bhashini and Language Context
export interface Language {
  code: string;
  name: string;
}

// Updated Bhashini response types to match Flask server
export interface BhashiniErrorResponse {
  error: string;
  status_code?: number;
  details?: string;
}

export interface TextLanguageDetectionResponse {
  langCode?: string;
  error?: string;
}

export interface TranslationResponse {
  translated_text?: string;
  error?: string;
}

export interface TtsResponse {
  audio_content?: string; // Base64 encoded audio
  error?: string;
}

export interface SttResponse {
    transcribed_text?: string;
    error?: string;
}

export interface SupportedLanguagesResponse {
    supported_languages?: Language[];
    error?: string;
}
