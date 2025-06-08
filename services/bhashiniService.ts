
import { BHASHINI_API_BASE_URL } from '../constants';
import { 
    BhashiniErrorResponse, 
    TextLanguageDetectionResponse, 
    // TranslationResponse, // Removed as Gemini will handle
    TtsResponse, // Keep for now as ChatbotInterface still uses it
    // SttResponse, // Removed as Gemini will handle
    SupportedLanguagesResponse,
    Language
} from '../types';

const HEADERS_JSON = {
  "Accept": "application/json",
  "Content-Type": "application/json",
};

// Common error handler
async function handleBhashiniResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      const textError = await response.text();
      throw new Error(`Bhashini API request failed with status ${response.status}: ${textError || response.statusText}`);
    }
    const bhashiniError = errorData as BhashiniErrorResponse;
    throw new Error(
      `Bhashini API Error: ${bhashiniError.error || response.statusText
      } (Status: ${response.status}) ${bhashiniError.details ? `- ${bhashiniError.details}` : ''}`
    );
  }
  return response.json() as Promise<T>;
}

export const getSupportedLanguages = async (): Promise<Language[]> => {
    try {
        const response = await fetch(`${BHASHINI_API_BASE_URL}/bhashini/supported-languages`, {
            method: 'GET',
            headers: { "Accept": "application/json" },
        });
        const data = await handleBhashiniResponse<SupportedLanguagesResponse>(response);
        if (data.error) {
            console.warn(`Fetching supported languages returned an error: ${data.error}`);
            return [];
        }
        return data.supported_languages || [];
    } catch (error) {
        console.error('Error in getSupportedLanguages:', error);
        return []; 
    }
}

export const detectTextLanguage = async (text: string): Promise<string | null> => { // Return null if truly undetectable
  if (!text.trim()) return null; // Cannot detect language of empty string
  try {
    const response = await fetch(`${BHASHINI_API_BASE_URL}/bhashini/detect-language`, {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify({ text }),
    });
    const data = await handleBhashiniResponse<TextLanguageDetectionResponse>(response);
    
    if (data.langCode && data.langCode.toLowerCase() !== 'unknown') {
      return data.langCode;
    }
    if (data.error) {
         console.warn(`Language detection returned an error message: ${data.error}.`);
    }
    // console.warn("Language detection failed or returned 'unknown'. Response:", data);
    return null; // Return null if cannot determine
  } catch (error) {
    console.error('Error in detectTextLanguage:', error);
    return null; // Return null on error
  }
};

// Bhashini TTS is kept for now as ChatbotInterface still uses it.
// If Gemini TTS is preferred, it would need a new function in geminiService.ts and ChatbotInterface updated.
export const textToSpeech = async (
  text: string,
  sourceLanguage?: string
): Promise<string | null> => {
  try {
    const payload: { text: string; sourceLan?: string } = { text };
    if (sourceLanguage) {
      payload.sourceLan = sourceLanguage;
    }

    const response = await fetch(`${BHASHINI_API_BASE_URL}/bhashini/tts`, {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify(payload),
    });
    const data = await handleBhashiniResponse<TtsResponse>(response);
    if (data.error) throw new Error(data.error);
    return data.audio_content || null;
  } catch (error) {
    console.error('Error in Bhashini textToSpeech:', error);
    throw error;
  }
};

// Bhashini translateText and speechToTextBhashini are no longer needed
// as Gemini versions are implemented in geminiService.ts and used.
