import { PROGRESS_STORAGE_KEY } from '../constants';
import { UserProgress, AllUserProgress, QuizScoreData } from '../types';

export const getProgressForUser = (userId: string): UserProgress => {
  try {
    const allProgressString = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!allProgressString) {
      return { readLessons: [], quizScores: {} };
    }
    const allProgress: AllUserProgress = JSON.parse(allProgressString);
    return allProgress[userId] || { readLessons: [], quizScores: {} };
  } catch (error) {
    console.error("Error reading progress from localStorage:", error);
    return { readLessons: [], quizScores: {} }; // Return default on error
  }
};

export const saveProgressForUser = (userId: string, data: UserProgress): void => {
  try {
    const allProgressString = localStorage.getItem(PROGRESS_STORAGE_KEY);
    let allProgress: AllUserProgress = {};
    if (allProgressString) {
      allProgress = JSON.parse(allProgressString);
    }
    allProgress[userId] = data;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error("Error saving progress to localStorage:", error);
  }
};

export const markLessonAsRead = (userId: string, moduleId: string, lessonId: string): UserProgress => {
  const progress = getProgressForUser(userId);
  const lessonKey = `${moduleId}_${lessonId}`; // Use underscore for easier splitting if needed later
  if (!progress.readLessons.includes(lessonKey)) {
    progress.readLessons = [...progress.readLessons, lessonKey];
    saveProgressForUser(userId, progress);
  }
  return progress;
};

export const markLessonAsUnread = (userId: string, moduleId: string, lessonId: string): UserProgress => {
  const progress = getProgressForUser(userId);
  const lessonKey = `${moduleId}_${lessonId}`;
  progress.readLessons = progress.readLessons.filter(key => key !== lessonKey);
  saveProgressForUser(userId, progress);
  return progress;
};

export const isLessonRead = (userId: string, moduleId: string, lessonId: string): boolean => {
  const progress = getProgressForUser(userId);
  const lessonKey = `${moduleId}_${lessonId}`;
  return progress.readLessons.includes(lessonKey);
};

export const saveQuizResult = (
  userId: string,
  moduleId: string,
  score: number,
  totalQuestions: number
): UserProgress => {
  const progress = getProgressForUser(userId);
  const quizData: QuizScoreData = {
    score,
    total: totalQuestions,
    percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
    lastAttempt: Date.now(),
  };
  progress.quizScores = { ...progress.quizScores, [moduleId]: quizData };
  saveProgressForUser(userId, progress);
  return progress;
};

export const getQuizResult = (userId: string, moduleId: string): QuizScoreData | undefined => {
    const progress = getProgressForUser(userId);
    return progress.quizScores[moduleId];
};
