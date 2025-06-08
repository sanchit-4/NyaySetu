
import React, { useState, useEffect, useCallback } from 'react';
import { QuizQuestion, QuizOption as QuizOptionType } from '../../types';
import Button from '../common/Button';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, SpinnerIcon } from '../icons';
import { saveQuizResult, getQuizResult } from '../../utils/progressService';
import { useLanguage } from '../../context/LanguageContext';

interface QuizViewProps {
  questions: QuizQuestion[];
  moduleTitle: string; // Already translated by ModuleView
  moduleId: string;
  userId: string;
}

interface TranslatedQuizQuestion extends QuizQuestion {
  translatedQuestionText: string;
  translatedOptions: TranslatedQuizOption[];
  translatedExplanation?: string;
}
interface TranslatedQuizOption extends QuizOptionType {
  translatedText: string;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, moduleTitle, moduleId, userId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [previousScoreData, setPreviousScoreData] = useState<ReturnType<typeof getQuizResult>>(undefined);
  
  const { translate, currentLanguage } = useLanguage();
  const [translatedQuestions, setTranslatedQuestions] = useState<TranslatedQuizQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);


  const translateAllQuestions = useCallback(async () => {
    if (!questions || questions.length === 0) {
      setIsLoadingQuestions(false);
      return;
    }
    setIsLoadingQuestions(true);
    const newTranslatedQuestions = await Promise.all(
      questions.map(async (q) => {
        const translatedQText = await translate(q.questionText);
        const translatedOpts = await Promise.all(
          q.options.map(async (opt) => ({
            ...opt,
            translatedText: await translate(opt.text),
          }))
        );
        const translatedExpl = q.explanation ? await translate(q.explanation) : undefined;
        return {
          ...q,
          translatedQuestionText: translatedQText,
          translatedOptions: translatedOpts,
          translatedExplanation: translatedExpl,
        };
      })
    );
    setTranslatedQuestions(newTranslatedQuestions);
    setIsLoadingQuestions(false);
  }, [questions, translate]);

  useEffect(() => {
    translateAllQuestions();
  }, [translateAllQuestions, currentLanguage]); // Retranslate if language changes

  useEffect(() => {
    const prevResult = getQuizResult(userId, moduleId);
    setPreviousScoreData(prevResult);
  }, [userId, moduleId, quizFinished]);

  if (isLoadingQuestions) {
    return (
        <div className="p-6 sm:p-8 bg-white rounded-xl shadow-xl text-center">
            <SpinnerIcon className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-mediumtext">Loading quiz questions...</p>
        </div>
    );
  }

  if (!translatedQuestions || translatedQuestions.length === 0) {
    return <p className="text-mediumtext p-6 bg-white rounded-lg shadow text-center">No quiz questions available for this module yet.</p>;
  }

  const currentQuestion = translatedQuestions[currentQuestionIndex];

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId) return;
    setShowFeedback(true);
    // Compare selectedOptionId with original question's correctOptionId
    if (selectedOptionId === questions[currentQuestionIndex].correctOptionId) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOptionId(null);
    if (currentQuestionIndex < translatedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
      saveQuizResult(userId, moduleId, score, translatedQuestions.length); 
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setScore(0);
    setShowFeedback(false);
    setQuizFinished(false);
    const prevResult = getQuizResult(userId, moduleId); // Re-fetch, though might not change immediately
    setPreviousScoreData(prevResult);
    // Re-trigger translation if needed, though usually language doesn't change during restart
    translateAllQuestions();
  };

  if (quizFinished) {
    const finalScoreData = getQuizResult(userId, moduleId) || { score: score, total: translatedQuestions.length, percentage: Math.round((score / translatedQuestions.length) * 100), lastAttempt: Date.now() };
    const percentage = finalScoreData.percentage;

    return (
      <div className="p-6 sm:p-8 bg-white rounded-xl shadow-2xl text-center animate-fadeIn border-t-4 border-primary">
        <h2 className="text-3xl font-bold text-primary-dark mb-2">Quiz Completed!</h2>
        <p className="text-xl text-mediumtext mb-4">Module: {moduleTitle}</p>
        <p className="text-6xl font-extrabold my-6" style={{ color: percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444' }}>
          {percentage}%
        </p>
        <p className="text-xl text-darktext mb-6">Your Score: {finalScoreData.score} / {finalScoreData.total}</p>
        <div className="w-full bg-gray-200 rounded-full h-8 mb-6 dark:bg-gray-700 overflow-hidden shadow-inner">
          <div 
            className={`h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-700 ease-out ${percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : percentage >= 40 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`} 
            style={{ width: `${percentage}%` }}
          >
           {percentage > 10 && `${percentage}%`}
          </div>
        </div>
         {previousScoreData && previousScoreData.lastAttempt !== finalScoreData.lastAttempt && ( 
          <p className="text-sm text-mediumtext mb-6">
            Your previous best score for this quiz: {previousScoreData.percentage}%
          </p>
        )}
        <Button onClick={handleRestartQuiz} variant="primary" size="lg" className="bg-primary hover:bg-primary-dark" leftIcon={<ArrowPathIcon className="w-5 h-5"/>}>
          Restart Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-white rounded-xl shadow-xl animate-fadeIn border-t-4 border-secondary">
      <div className="flex justify-between items-start mb-2">
         <div>
            <h2 className="text-2xl font-semibold text-darktext">Quiz: <span className="text-secondary">{moduleTitle}</span></h2>
            <p className="text-sm text-mediumtext">Question {currentQuestionIndex + 1} of {translatedQuestions.length}</p>
         </div>
         {previousScoreData && (
            <p className="text-xs text-mediumtext bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                Best: {previousScoreData.percentage}%
            </p>
         )}
      </div>
      
      <div className="mb-6 p-5 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-sky-50 min-h-[100px] flex items-center shadow-sm">
        <p className="text-lg font-medium text-darktext">{currentQuestion.translatedQuestionText}</p>
      </div>

      <div className="space-y-3 mb-6">
        {currentQuestion.translatedOptions.map((option) => {
          const isSelected = selectedOptionId === option.id;
          // Feedback comparison uses original correctOptionId from untranslated question data
          const isCorrect = option.id === questions[currentQuestionIndex].correctOptionId; 
          
          let baseButtonClass = 'border-gray-300 hover:border-primary-light hover:bg-blue-50/50 text-darktext focus:ring-primary-light';
          let selectedIcon = null;

          if (showFeedback) {
            if (isCorrect) {
              baseButtonClass = 'bg-green-100 border-green-500 text-green-800 ring-2 ring-green-400 font-semibold';
              selectedIcon = <CheckCircleIcon className="w-6 h-6 text-green-600 ml-3 flex-shrink-0" />;
            } else if (isSelected && !isCorrect) {
              baseButtonClass = 'bg-red-100 border-red-500 text-red-800 ring-2 ring-red-400';
              selectedIcon = <XCircleIcon className="w-6 h-6 text-red-600 ml-3 flex-shrink-0" />;
            } else {
              baseButtonClass = 'border-gray-300 opacity-70 cursor-not-allowed text-gray-500';
            }
          } else if (isSelected) {
            baseButtonClass = 'bg-blue-100 border-primary ring-2 ring-primary text-primary-dark font-medium shadow-md';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={showFeedback}
              className={`w-full text-left p-4 border rounded-lg transition-all duration-200 flex items-center justify-between focus:outline-none focus:ring-2 ${baseButtonClass}`}
              aria-pressed={isSelected}
            >
              <span className="flex-grow text-sm sm:text-base">{option.translatedText}</span>
              {selectedIcon}
            </button>
          );
        })}
      </div>

      {showFeedback && currentQuestion.translatedExplanation && (
        <div className={`p-4 rounded-md mb-6 text-sm shadow-sm ${selectedOptionId === questions[currentQuestionIndex].correctOptionId ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <strong className="block mb-1 text-base">Explanation:</strong> {currentQuestion.translatedExplanation}
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <p className="text-sm text-mediumtext">Score: {score}/{translatedQuestions.length}</p>
        {showFeedback ? (
          <Button onClick={handleNextQuestion} variant="primary" size="md" className="min-w-[140px]">
            {currentQuestionIndex < translatedQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'} &rarr;
          </Button>
        ) : (
          <Button onClick={handleSubmitAnswer} variant="secondary" size="md" disabled={!selectedOptionId} className="min-w-[140px]">
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
