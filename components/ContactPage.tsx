import React, { useState } from 'react';
import sampleStorybooksData from './sample_story.json'; // Assuming you have a separate file for sample data

interface Story {
  id: string;
  story: string;
  translatedStory?: string;
  audio_name: {
    english: string;
    hindi: string;
  };
  audioUrl?: string;
  currentLanguage: string;
}

const StorybookPlayer: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'mr', name: 'Marathi' },
    { code: 'kn', name: 'Kannada' },
  ];


  // Translate text using Bhashini API
  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (targetLanguage === 'en') {
      return text; // No translation needed for English
    }

    try {
      const response = await fetch('api/bhashini/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          inputLan: 'en',
          outputLan: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Assuming the API returns translated text in a specific format
      // Adjust this based on your actual API response structure
      const translatedText = data.pipelineResponse?.[0]?.output?.[0]?.target || 
                           data.translatedText || 
                           data.output || 
                           text; // Fallback to original text

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }
  };

  // Generate audiobooks with delay simulation
  const generateAudiobooks = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setStories([]);

    try {
      // Simulate generation process with progress updates
      const totalSteps = 100;
      const stepDuration = 5; // 6 seconds total (6000ms / 100 steps)

      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        setGenerationProgress(i);
      }

      // Process the storybooks data
      const processedStories: Story[] = sampleStorybooksData.map((item, index) => ({
        id: `story-${index + 1}`,
        story: item.story,
        audio_name: item.audio_name,
        currentLanguage: 'en', // Default to English
        // Set initial audio URL based on selected language
        audioUrl: selectedLanguage === 'hi' 
          ? `/audioFiles/${item.audio_name.hindi}`
          : `/audioFiles/${item.audio_name.english}`
      }));

      const randomIndex = Math.floor(Math.random() * processedStories.length);
      const selectedStory = processedStories[randomIndex];
      setStories([selectedStory]);
      
      // If a non-English language is selected, translate all stories
      if (selectedLanguage !== 'en') {
        await translateAllStories(processedStories, selectedLanguage);
      }
      
    } catch (err) {
      setError('Failed to generate audiobooks. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Translate all stories to the selected language
  const translateAllStories = async (storiesToTranslate: Story[], targetLanguage: string) => {
    setIsTranslating(true);
    
    try {
      const translatedStories = await Promise.all(
        storiesToTranslate.map(async (story) => {
          try {
            const translatedText = await translateText(story.story, targetLanguage);
            return {
              ...story,
              translatedStory: translatedText,
              currentLanguage: targetLanguage,
              audioUrl: targetLanguage === 'hi'
                ? `/audioFiles/${story.audio_name.hindi}`
                : `/audioFiles/${story.audio_name.english}` // For other languages, use English audio
            };
          } catch (error) {
            console.error(`Failed to translate story ${story.id}:`, error);
            return {
              ...story,
              currentLanguage: targetLanguage,
              audioUrl: `/audioFiles/${story.audio_name.english}` // Fallback to English audio
            };
          }
        })
      );

      setStories(translatedStories);
    } catch (error) {
      setError('Failed to translate some stories. Please try again.');
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle language change
  const handleLanguageChange = async (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    
    if (stories.length > 0) {
      setIsTranslating(true);
      
      try {
        if (newLanguage === 'en') {
          // Switch back to English
          const updatedStories = stories.map(story => ({
            ...story,
            currentLanguage: 'en',
            audioUrl: `/audioFiles/${story.audio_name.english}`
          }));
          setStories(updatedStories);
        } else {
          // Translate to new language
          await translateAllStories(stories, newLanguage);
        }
      } catch (error) {
        setError('Failed to change language. Please try again.');
      }
    }
  };

  // Play audio function
  const playAudio = async (storyId: string, audioUrl: string) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingStoryId(null);
    }

    // If clicking the same story that was playing, just stop
    if (playingStoryId === storyId) {
      return;
    }

    try {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setCurrentAudio(null);
        setPlayingStoryId(null);
      };

      audio.onerror = () => {
        console.error('Audio failed to load:', audioUrl);
        setError(`Failed to load audio: ${audioUrl.split('/').pop()}`);
        setCurrentAudio(null);
        setPlayingStoryId(null);
      };
      
      await audio.play();
      setCurrentAudio(audio);
      setPlayingStoryId(storyId);
      setError(null);
      
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play audio. Please check if the audio file exists.');
    }
  };

  // Stop audio function
  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingStoryId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <span className="text-indigo-600 text-4xl">📚</span>
            Multilingual Storybook Player
          </h1>
          <p className="text-gray-600">Generate, translate, and listen to stories in multiple languages</p>
        </div>

        {/* Language Selection and Generate Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <span className="text-purple-600 text-xl">🌐</span>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isGenerating || isTranslating}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generateAudiobooks}
            disabled={isGenerating || isTranslating}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin text-2xl">⚡</span>
                <div className="flex flex-col items-start">
                  <span>Generating...</span>
                  <span className="text-sm opacity-80">{generationProgress}%</span>
                </div>
              </>
            ) : isTranslating ? (
              <>
                <span className="animate-spin text-2xl">🔄</span>
                Translating...
              </>
            ) : (
              <>
                <span className="text-2xl">🎵</span>
                Generate Audiobooks
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="mb-6 w-full max-w-md mx-auto">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Language Info */}
        {stories.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 flex items-center gap-2">
              <span>ℹ️</span>
              Currently displaying stories in: <strong>{languages.find(lang => lang.code === selectedLanguage)?.name}</strong>
   
            </p>
          </div>
        )}

        {/* Stories Display */}
        <div className="space-y-6">
          {stories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4 text-6xl">📖</div>
              <p className="text-gray-500 text-lg">No stories available</p>
              <p className="text-gray-400">Click "Generate Audiobooks" to load your stories!</p>
            </div>
          ) : (
            stories.map((story) => (
              <div
                key={story.id}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Story Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 text-xl">📖</span>
                    <span className="text-sm font-medium text-gray-600">
                      Story #1
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                      {languages.find(lang => lang.code === story.currentLanguage)?.name}
                    </span>
             
                  </div>
                </div>

                {/* Story Content */}
                <div className="mb-6">
                  <p className="text-gray-800 leading-relaxed text-justify">
                    {story.translatedStory || story.story}
                  </p>
                </div>

                {/* Audio Controls */}
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => 
                      playingStoryId === story.id 
                        ? stopAudio() 
                        : playAudio(story.id, story.audioUrl!)
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
                  >
                    {playingStoryId === story.id ? (
                      <>
                        <span className="text-lg">⏸️</span>
                        Stop Audio
                      </>
                    ) : (
                      <>
                        <span className="text-lg">▶️</span>
                        Play Audio
                      </>
                    )}
                  </button>

                  {playingStoryId === story.id && (
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="animate-pulse text-lg">🎵</span>
                      <span className="text-sm font-medium">Now Playing</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {stories.length > 0 && (
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              📁 Audio files should be located in: <code className="bg-gray-100 px-2 py-1 rounded">jhh</code>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              English and Hindi have dedicated audio files. Other languages use English audio with translated text.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorybookPlayer;