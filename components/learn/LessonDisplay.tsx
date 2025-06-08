
import React, { useState, useEffect, useCallback } from 'react';
import { Lesson, AccordionItem } from '../../types';
import { ChevronDownIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '../icons';
import Button from '../common/Button';
import { markLessonAsRead, markLessonAsUnread, isLessonRead } from '../../utils/progressService';
import { renderStructuredContent, StructuredContentItem } from '../../data/learnData'; // Corrected import
import { useLanguage } from '../../context/LanguageContext';
import { SpinnerIcon } from '../icons/SpinnerIcon'; // For loading state

interface TranslatedAccordionItem extends AccordionItem {
  originalContent: React.ReactNode; // Store original for re-translation if needed
}

interface AccordionProps {
  items: TranslatedAccordionItem[];
  userId: string;
  moduleId: string;
  onToggleReadStatus: (lessonId: string, isRead: boolean) => void;
  getLessonReadStatus: (lessonId: string) => boolean;
  isLoadingContent: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ items, userId, moduleId, onToggleReadStatus, getLessonReadStatus, isLoadingContent }) => {
  const [openItemId, setOpenItemId] = useState<string | null>(items.length > 0 ? items[0].id : null);

  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  if (isLoadingContent && items.length === 0) {
    return (
      <div className="flex justify-center items-center p-10">
        <SpinnerIcon className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-mediumtext">Loading lessons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const lessonIsRead = getLessonReadStatus(item.id);
        return (
          <div key={item.id} className={`bg-white shadow-lg rounded-xl overflow-hidden border-2 transition-all duration-300 ${lessonIsRead ? 'border-green-400 hover:border-green-500' : 'border-gray-200 hover:border-primary-light'}`}>
            <div className="flex justify-between items-center p-4 sm:p-5 hover:bg-primary-light/10 focus-within:ring-2 focus-within:ring-primary-light">
              <button
                onClick={() => toggleItem(item.id)}
                aria-expanded={openItemId === item.id}
                aria-controls={`content-${item.id}`}
                className="flex-grow text-left text-base sm:text-lg font-semibold text-primary-dark focus:outline-none flex items-center"
              >
                {lessonIsRead && <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 flex-shrink-0" />}
                <span id={`title-${item.id}`}>{isLoadingContent ? 'Loading title...' : item.title}</span>
              </button>
              <div className="flex items-center space-x-2 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleReadStatus(item.id, !lessonIsRead)}
                  title={lessonIsRead ? "Mark as Unread" : "Mark as Read"}
                  className={`p-1.5 rounded-full ${lessonIsRead ? 'text-green-600 hover:bg-green-100' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {lessonIsRead ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </Button>
                <ChevronDownIcon className={`w-5 h-5 sm:w-6 sm:h-6 transform transition-transform duration-300 text-gray-500 ${openItemId === item.id ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {openItemId === item.id && (
              <div
                id={`content-${item.id}`}
                role="region"
                aria-labelledby={`title-${item.id}`}
                className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50/50 text-mediumtext prose max-w-none prose-sm sm:prose-base prose-strong:text-darktext prose-headings:text-primary-dark prose-a:text-primary hover:prose-a:text-primary-dark"
              >
                {isLoadingContent ? <SpinnerIcon className="w-6 h-6 animate-spin text-primary" /> : item.content}
                 <Button
                    variant={lessonIsRead ? "ghost" : "primary"}
                    size="sm"
                    onClick={() => onToggleReadStatus(item.id, !lessonIsRead)}
                    title={lessonIsRead ? "Mark as Unread" : "Mark as Read"}
                    className={`mt-6 p-2 ${lessonIsRead ? 'text-green-700 bg-green-100 hover:bg-green-200 border border-green-500' : 'text-white bg-primary hover:bg-primary-dark border border-transparent'}`}
                    leftIcon={lessonIsRead ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  >
                    {lessonIsRead ? "Marked as Read" : "Mark as Read"}
                  </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


interface LessonDisplayProps {
  lessons: Lesson[];
  userId: string;
  moduleId: string;
}

const LessonDisplay: React.FC<LessonDisplayProps> = ({ lessons, userId, moduleId }) => {
  const [, forceUpdate] = useState({}); 
  const { translate, currentLanguage } = useLanguage();
  const [translatedLessons, setTranslatedLessons] = useState<TranslatedAccordionItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const translateStructuredContentItem = async (item: StructuredContentItem): Promise<StructuredContentItem> => {
    switch (item.type) {
      case 'paragraph':
        return { ...item, content: await translate(item.content) };
      case 'heading':
        return { ...item, content: await translate(item.content) };
      case 'list':
        const translatedListItems = await Promise.all(item.items.map(li => translate(li)));
        return { ...item, items: translatedListItems };
      default:
        return item;
    }
  };

  const translateLessonContent = useCallback(async (contentNode: React.ReactNode): Promise<React.ReactNode> => {
    if (typeof contentNode === 'string') {
      return translate(contentNode);
    }
    if (Array.isArray(contentNode)) { // Assuming it's an array of StructuredContentItem from createLessonContent
      const translatedItems = await Promise.all(
        contentNode.map(item => translateStructuredContentItem(item as StructuredContentItem))
      );
      return renderStructuredContent(translatedItems); // Render the translated structured items
    }
    // If it's already a React element or other, return as is (might be pre-rendered or simple)
    // Complex JSX in learnData.ts not directly using helpers would not be translated here.
    return contentNode;
  }, [translate]);


  useEffect(() => {
    const processLessons = async () => {
      if (!lessons) return;
      setIsLoadingContent(true);
      const newTranslatedLessons = await Promise.all(
        lessons.map(async (lesson) => {
          const translatedTitle = await translate(lesson.title);
          // Store original content to allow re-translation if language changes affecting already rendered content.
          // The 'content' from learnData is typically a result of createLessonContent, which is an array of StructuredContentItem.
          const translatedContentNode = await translateLessonContent(lesson.content);
          
          return {
            id: lesson.id,
            title: translatedTitle,
            content: translatedContentNode,
            originalContent: lesson.content, // Keep original structure for re-translation
          };
        })
      );
      setTranslatedLessons(newTranslatedLessons);
      setIsLoadingContent(false);
    };
    processLessons();
  }, [lessons, translate, currentLanguage, translateLessonContent]);


  if (!lessons || lessons.length === 0) {
    return <p className="text-mediumtext p-6 bg-white rounded-lg shadow text-center">No lessons available for this module yet.</p>;
  }

  const handleToggleReadStatus = (lessonId: string, markAsReadNext: boolean) => {
    if (markAsReadNext) {
      markLessonAsRead(userId, moduleId, lessonId);
    } else {
      markLessonAsUnread(userId, moduleId, lessonId);
    }
    forceUpdate({}); 
  };

  const getLessonReadStatus = (lessonId: string): boolean => {
    return isLessonRead(userId, moduleId, lessonId);
  };

  return (
    <div className="mt-0 sm:mt-2 animate-fadeIn">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-darktext">Lessons</h2>
      </div>
      <Accordion 
        items={translatedLessons} 
        userId={userId} 
        moduleId={moduleId}
        onToggleReadStatus={handleToggleReadStatus}
        getLessonReadStatus={getLessonReadStatus}
        isLoadingContent={isLoadingContent}
      />
    </div>
  );
};

export default LessonDisplay;
