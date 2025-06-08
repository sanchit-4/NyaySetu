import React from 'react';

interface FloatingFlashcardProps {
  text: string;
  style?: React.CSSProperties; // For animationDelay, animationDuration
}

const FloatingFlashcard: React.FC<FloatingFlashcardProps> = ({ text, style }) => {
  const colors = [
    'bg-sky-500/30', 'bg-indigo-500/30', 'bg-purple-500/30', 
    'bg-pink-500/30', 'bg-blue-500/30', 'bg-emerald-500/30'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Generate a random rotation class. Tailwind needs full class names.
  // For dynamic values, inline style `transform: rotate(...)` is better if JIT can't pick up arbitrary values.
  // Let's use a few predefined rotation classes for simplicity with Tailwind.
  const rotations = ['rotate-[-6deg]', 'rotate-[-3deg]', 'rotate-[0deg]', 'rotate-[3deg]', 'rotate-[6deg]'];
  const randomRotateClass = rotations[Math.floor(Math.random() * rotations.length)];

  return (
    <div 
      className={`absolute p-3 sm:p-4 rounded-lg shadow-xl text-xs sm:text-sm font-semibold text-white/80 animate-float ${randomColor} ${randomRotateClass} pointer-events-none`}
      style={style} // style will apply animationDelay and animationDuration
    >
      {text}
    </div>
  );
};

export default FloatingFlashcard;