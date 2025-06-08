
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LearningModule, User } from '../../types'; 
import { PATHS } from '../../constants';
import { BookOpenIcon, QuizIcon } from '../icons';
import { useLanguage } from '../../context/LanguageContext'; 

interface LearningModuleCardProps {
  module: LearningModule;
  user: User; 
}

const LearningModuleCard: React.FC<LearningModuleCardProps> = ({ module, user }) => {
  const modulePath = PATHS.LEARN_MODULE_LESSONS.replace(':moduleId', module.id);
  const { translate, currentLanguage } = useLanguage();

  const [translatedTitle, setTranslatedTitle] = useState(module.title);
  const [translatedDescription, setTranslatedDescription] = useState(module.description);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

  useEffect(() => {
    const doTranslate = async () => {
      if (!module.title && !module.description) return; // Nothing to translate

      setIsLoadingTranslation(true);
      try {
        const titlePromise = translate(module.title); // Source assumed 'en' by translate default
        const descriptionPromise = translate(module.description);
        
        const [newTitle, newDescription] = await Promise.all([titlePromise, descriptionPromise]);
        
        setTranslatedTitle(newTitle);
        setTranslatedDescription(newDescription);
      } catch (error) {
        console.error("Error translating module card content:", error);
        // Fallback to original if error
        setTranslatedTitle(module.title);
        setTranslatedDescription(module.description);
      } finally {
        setIsLoadingTranslation(false);
      }
    };
    
    // Only translate if the current language is not English, or to refresh if module data changes.
    // The translate function itself handles if currentLanguage === 'en'.
    doTranslate();

  }, [module.title, module.description, translate, currentLanguage]); // Rerun if these change


  const cardColors = [
    'from-blue-500 to-blue-700',
    'from-green-500 to-green-700',
    'from-purple-500 to-purple-700',
    'from-red-500 to-red-700',
    'from-yellow-500 to-yellow-700',
    'from-indigo-500 to-indigo-700',
    'from-pink-500 to-pink-700',
    'from-sky-500 to-sky-700',
  ];
  const colorIndex = module.id.length % cardColors.length;
  const cardGradient = cardColors[colorIndex] || cardColors[0];

  return (
    <Link 
      to={modulePath} 
      className={`group bg-gradient-to-br ${cardGradient} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col text-white overflow-hidden aspect-[4/3] sm:aspect-[3/2.5]`}
    >
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        <div className="mb-3 sm:mb-4">
          {module.icon && <module.icon className="w-10 h-10 sm:w-12 sm:h-12 text-white/80 mb-2 transition-transform duration-300 group-hover:scale-110" />}
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight min-h-[2.5em]">{isLoadingTranslation && !translatedTitle ? '...' : translatedTitle}</h3>
        </div>
        <p className="text-xs sm:text-sm text-white/90 mb-4 flex-grow line-clamp-3 group-hover:line-clamp-none transition-all duration-200 min-h-[3em]">
          {isLoadingTranslation && !translatedDescription ? '...' : translatedDescription}
        </p>
        
        <div className="mt-auto border-t border-white/20 pt-3 sm:pt-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-white/80">
            <span className="flex items-center">
              <BookOpenIcon className="w-4 h-4 mr-1.5" />
              {module.lessons.length} Lessons
            </span>
            <span className="flex items-center">
              <QuizIcon className="w-4 h-4 mr-1.5" />
              {module.quiz.length} Questions
            </span>
          </div>
        </div>
      </div>
      <div className="bg-black/20 text-center py-2 sm:py-2.5 text-sm font-semibold group-hover:bg-black/30 transition-colors duration-200">
        Start Learning &rarr;
      </div>
    </Link>
  );
};

export default LearningModuleCard;
