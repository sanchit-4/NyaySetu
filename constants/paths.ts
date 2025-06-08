export const PATHS = {
  LANDING: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  AUTH_ROUTE_PATTERN: "/auth/:provider",
  DASHBOARD_ROOT: "/dashboard",
  LEARN_MODULE: "/dashboard/learn/:moduleId",
  LEARN_MODULE_LESSONS: "/dashboard/learn/:moduleId/lessons",
  LEARN_MODULE_QUIZ: "/dashboard/learn/:moduleId/quiz",
  CHATBOT: "/dashboard/chatbot",
  DOCUMENTS: "/dashboard/documents",
  PROGRESS: "/dashboard/progress",
  ABOUT_US: "/dashboard/about",
  CONTACT: "/dashboard/contact",
  FLASHCARDS: "/dashboard/flashcards", // Added FLASHCARDS path
} as const;
export const AUTH_MODES = {
  LOGIN: "login",
  SIGNUP: "signup",
};
export const APP_NAME = "Nyay Sahayak"; // Application name constant

export type PathsType = typeof PATHS;
