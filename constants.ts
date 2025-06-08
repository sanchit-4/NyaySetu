export const APP_NAME = "Nyay Sahayak";
// Use gemini-2.5-flash-preview-04-17 for text and vision tasks with the chatbot.
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const GEMINI_VISION_MODEL = "gemini-2.5-flash-preview-04-17"; // This model is multimodal.
// For dedicated image generation (not currently used by chatbot for generating images, but for understanding them):
// export const IMAGEN_MODEL = "imagen-3.0-generate-002"; 

export const BHASHINI_API_BASE_URL = "http://localhost:5000"; // Base URL for your Bhashini Flask backend

export const PATHS = {
  LANDING: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  AUTH_ROUTE_PATTERN: '/auth/:mode',
  
  DASHBOARD_ROOT: '/dashboard', // Base for all dashboard views
  // Learn modules will be displayed at DASHBOARD_ROOT
  LEARN_MODULE: '/dashboard/learn/:moduleId', // Specific module content (lessons, quiz)
  LEARN_MODULE_LESSONS: '/dashboard/learn/:moduleId/lessons',
  LEARN_MODULE_QUIZ: '/dashboard/learn/:moduleId/quiz',
  
  CHATBOT: '/dashboard/chatbot',
  DOCUMENTS: '/dashboard/documents',
  PROGRESS: '/dashboard/progress', // New
  ABOUT_US: '/dashboard/about', // New
  CONTACT: '/dashboard/contact', // New
};

export const AUTH_MODES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
};

export const PROGRESS_STORAGE_KEY = 'nyaySahayakUserProgress';