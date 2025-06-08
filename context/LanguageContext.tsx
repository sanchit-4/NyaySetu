
import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { Language } from '../types';
// Removed: import { translateText as bhashiniTranslate } from '../services/bhashiniService';
import { getSupportedLanguages as bhashiniGetSupportedLanguages } from '../services/bhashiniService'; // Keep for now
import { translateTextWithGemini } from '../services/geminiService'; // Use Gemini for translation

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (langCode: string) => void;
  translate: (text: string, targetLangOverride?: string, sourceLangOverride?: string) => Promise<string>;
  availableLanguages: Language[];
  isLoadingLanguages: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    return localStorage.getItem('nyaySahayakLanguage') || 'en';
  });
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([{ code: 'en', name: 'English' }]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState<boolean>(true);
  const [translationsCache, setTranslationsCache] = useState<Record<string, Record<string, string>>>({}); // { 'en_text': { 'hi': 'नमस्ते' } }

  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoadingLanguages(true);
      try {
        // For now, continue to use Bhashini to get the list of supported Indian languages.
        // This list informs the UI. Gemini's actual translation capability will be tested at runtime.
        const languages = await bhashiniGetSupportedLanguages();
        const englishExists = languages.some(lang => lang.code === 'en');
        let finalLanguages = languages;

        if (!englishExists && !languages.find(l => l.name.toLowerCase() === 'english')) { // Check name too
            finalLanguages = [{ code: 'en', name: 'English' }, ...languages];
        } else { 
            const engLang = languages.find(lang => lang.code === 'en' || lang.name.toLowerCase() === 'english');
            if (engLang) { // Ensure it's first
                 finalLanguages = [
                    engLang,
                    ...languages.filter(lang => lang.code !== engLang.code)
                ];
            } else { // Should not happen if englishExists was true, but as a safeguard
                 finalLanguages = [{ code: 'en', name: 'English' }, ...languages];
            }
        }
        setAvailableLanguages(finalLanguages.filter(l => l.code)); // Ensure no empty codes
      } catch (error) {
        console.error("Failed to fetch supported languages:", error);
        if (!availableLanguages.some(lang => lang.code === 'en')) {
            setAvailableLanguages([{ code: 'en', name: 'English' }]);
         }
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []); // Run once on mount

  const setCurrentLanguage = (langCode: string) => {
    setCurrentLanguageState(langCode);
    localStorage.setItem('nyaySahayakLanguage', langCode);
    // Optionally clear cache when language changes if source text might be non-English
    // setTranslationsCache({}); 
  };

  const translate = useCallback(async (text: string, targetLangOverride?: string, sourceLangOverride?: string): Promise<string> => {
    const targetLanguage = targetLangOverride || currentLanguage;
    const sourceLanguage = sourceLangOverride || 'en'; // Assume source is English if not specified

    if (targetLanguage === sourceLanguage || !text || targetLanguage === 'en' && sourceLanguage === 'en') {
      return text;
    }
    
    // Cache key includes source language to differentiate translations of same text from different sources
    const cacheKey = `${sourceLanguage}_${text}`; 
    if (translationsCache[cacheKey] && translationsCache[cacheKey][targetLanguage]) {
      return translationsCache[cacheKey][targetLanguage];
    }

    try {
      // Use Gemini for translation
      const translatedText = await translateTextWithGemini(text, targetLanguage, sourceLanguage);
      if (translatedText && translatedText !== text) { // Check if translation actually happened
        setTranslationsCache(prev => ({
          ...prev,
          [cacheKey]: {
            ...(prev[cacheKey] || {}),
            [targetLanguage]: translatedText,
          },
        }));
        return translatedText;
      }
      return text; // Fallback to original text if translation fails or returns same text
    } catch (error) {
      console.error(`Error translating "${text}" from ${sourceLanguage} to ${targetLanguage} using Gemini:`, error);
      return text; // Fallback to original text on error
    }
  }, [currentLanguage, translationsCache]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, translate, availableLanguages, isLoadingLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
