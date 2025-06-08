import React from 'react';
import { learningModules } from '../data/learnData';
import LearningModuleCard from './learn/LearningModuleCard';
import FloatingFlashcard from './FloatingFlashcard';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface LearnContentProps {
  user: User;
}

const LearnContent: React.FC<LearnContentProps> = ({ user }) => {
  const { translate } = useLanguage();
  const [headerTitle, setHeaderTitle] = React.useState('Welcome to Your Legal Learning Hub');
  const [headerSubtitle, setHeaderSubtitle] = React.useState(
    'Explore diverse aspects of the Indian legal system. Select a module below to begin your journey of knowledge and empowerment.'
  );

  React.useEffect(() => {
    const doTranslate = async () => {
      setHeaderTitle(await translate('Welcome to Your Legal Learning Hub'));
      setHeaderSubtitle(
        await translate(
          'Explore diverse aspects of the Indian legal system. Select a module below to begin your journey of knowledge and empowerment.'
        )
      );
    };
    doTranslate();
  }, [translate]);

  const flashcardData = [
    { id: 'fc1', text: 'FIR', top: '10%', left: '5%', delay: '0s', duration: '15s' },
    { id: 'fc2', text: 'PIL', top: '20%', left: '80%', delay: '3s', duration: '20s' },
    { id: 'fc3', text: 'Rights', top: '70%', left: '15%', delay: '1s', duration: '18s' },
    { id: 'fc4', text: 'IPC', top: '80%', left: '70%', delay: '5s', duration: '22s' },
    { id: 'fc5', text: 'CrPC', top: '40%', left: '45%', delay: '2s', duration: '16s' },
    { id: 'fc6', text: 'Article 14', top: '55%', left: '5%', delay: '6s', duration: '25s' },
    { id: 'fc7', text: 'Contract', top: '5%', left: '30%', delay: '4s', duration: '19s' },
  ];

  return (
    <div className="animate-fadeIn relative min-h-full">
      <div className="absolute inset-0 overflow-hidden z-0">
        {flashcardData.map(fc => (
          <FloatingFlashcard
            key={fc.id}
            text={fc.text}
            style={{
              top: fc.top,
              left: fc.left,
              animationDelay: fc.delay,
              animationDuration: fc.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <header className="mb-10 text-center py-8 px-4 bg-white/80 backdrop-blur-lg rounded-xl shadow-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mb-4">
            {headerTitle}
          </h1>
          <p className="text-lg sm:text-xl text-mediumtext max-w-3xl mx-auto">
            {headerSubtitle}
          </p>
        </header>

        {learningModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {learningModules.map(module => (
              <LearningModuleCard key={module.id} module={module} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/70 backdrop-blur-md rounded-xl shadow-lg">
            <p className="text-2xl text-darktext font-semibold">No learning modules available yet.</p>
            <p className="text-mediumtext mt-2">Please check back soon as we continuously update our content!</p>
          </div>
        )}

        {/* Calendly Scheduling Button */}
        <div className="mt-12 flex justify-center">
          <a
            href="https://calendly.com/sanchitgoyal2803/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all"
          >
            📅 Still have doubts? Consult a lawyer
          </a>
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg shadow-2xl text-center">
          <h2 className="text-3xl font-semibold mb-4">Stay Curious! More Content Is On The Way!</h2>
          <p className="text-lg opacity-90">
            We're committed to expanding our educational resources. Expect new modules, in-depth case studies, and interactive tools to further enhance your understanding of Indian law and your rights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LearnContent;
