
import { GoogleGenAI, GenerateContentResponse, Content, Part, FinishReason } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_VISION_MODEL } from '../constants';
import { ChatMessage, UploadedFile, DocumentAnalysisMessage } from '../types';

// API key is sourced from process.env.API_KEY as per guidelines.
// This application assumes `process.env.API_KEY` is pre-configured.
if (!process.env.API_KEY) {
  console.warn(
    "API_KEY for Google GenAI is not set in environment variables. Core AI functionality will be limited or fail."
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const defaultSystemInstructionText = `You are an AI legal assistant named Nyay Sahayak, specialized in the Indian Legal and Judiciary System.
Provide clear, concise, and informative answers.
Your knowledge base focuses on Indian law, legal procedures, rights, and the structure of the Indian judiciary.
If a question is outside this scope (e.g., medical advice, detailed financial advice, general knowledge unrelated to Indian law), politely state your area of expertise and decline to answer the specific off-topic question.
Always strive for accuracy and helpfulness within the legal domain of India.
Do not provide legal advice that could be construed as creating an attorney-client relationship. Instead, provide general legal information and suggest consulting a qualified legal professional in India for specific personal legal cases.
Format important legal terms or sections in bold. For lists, use bullet points.
Keep responses well-structured and easy to understand for a layperson. Be empathetic and supportive.`;

const documentAnalysisSystemInstructionText = `You are an AI legal assistant specialized in analyzing uploaded document images.
Your primary task is to answer questions based *solely* on the content visible in the provided image of the document.
If the question cannot be answered from the image, clearly state that.
Do not hallucinate or infer information beyond what is present in the document image.
When asked to summarize, provide a concise summary of the key points, facts, parties involved, and any discernible legal context or obligations mentioned in the document image.
Be precise and refer to specific parts of the document if possible by quoting short relevant phrases from the image text.
Format your response clearly. Use bullet points for summaries if appropriate.`;

const transformChatMessagesForGemini = (chatMessages: ChatMessage[]): Content[] => {
  return chatMessages
    .filter(msg => msg.id !== 'initial-bot-message' && msg.text.trim() !== '') 
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));
};

const transformDocumentMessagesForGemini = (docMessages: DocumentAnalysisMessage[]): Content[] => {
  return docMessages
    .filter(msg => msg.text.trim() !== '') 
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));
};


async function* createErrorStream(errorMessage: string, userFriendlyMessage?: string): AsyncIterable<GenerateContentResponse> {
  console.error("Error Stream Created:", errorMessage);
  const displayMessage = userFriendlyMessage || `An unexpected error occurred. Please try again. Details: ${errorMessage}`;
  const errorResponse: GenerateContentResponse = {
    candidates: [{
      content: { role: 'model', parts: [{text: displayMessage}] },
      finishReason: FinishReason.OTHER,
      index: 0,
      safetyRatings: [], 
    }],
    promptFeedback: undefined, 
    data: undefined,
    functionCalls: undefined,
    executableCode: undefined,
    codeExecutionResult: undefined,
    get text() { return displayMessage; }
  };
  yield errorResponse;
}

function createErrorResponse(errorMessage: string, userFriendlyMessage?: string): GenerateContentResponse {
    console.error("Error Response Created:", errorMessage);
    const displayMessage = userFriendlyMessage || `An unexpected error occurred. Please try again. Details: ${errorMessage}`;
    return {
        candidates: [{
            content: { role: 'model', parts: [{ text: displayMessage }] },
            finishReason: FinishReason.OTHER,
            index: 0,
            safetyRatings: [],
        }],
        promptFeedback: undefined,
        data: undefined,
        functionCalls: undefined,
        executableCode: undefined,
        codeExecutionResult: undefined,
        get text() { return displayMessage; }
    };
}


export const getGeminiStreamedResponse = async (
  messageHistory: ChatMessage[],
  newUserMessageText: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  if (!process.env.API_KEY) {
    return createErrorStream(
        "API_KEY_MISSING",
        "Error: Google GenAI API key is not configured. Chat functionality is unavailable."
    );
  }

  const geminiHistory = transformChatMessagesForGemini(messageHistory);
  const contents: Content[] = [
    ...geminiHistory,
    { role: 'user', parts: [{ text: newUserMessageText }] },
  ];

  try {
    const stream = await ai.models.generateContentStream({
      model: GEMINI_TEXT_MODEL,
      contents: contents,
      config: {
        systemInstruction: defaultSystemInstructionText,
      }
    });
    return stream;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Gemini text stream error.";
    return createErrorStream(errorMessage, `Sorry, I encountered an error communicating with the AI: ${errorMessage}`);
  }
};

export const generateContentWithImage = async ( 
  newUserMessageText: string, 
  imageFile: UploadedFile
): Promise<AsyncIterable<GenerateContentResponse>> => {
  if (!process.env.API_KEY) {
    return createErrorStream(
        "API_KEY_MISSING",
        "Error: Google GenAI API key is not configured. Document analysis is unavailable."
    );
  }
  if (!imageFile || !imageFile.base64Data || !imageFile.type) {
     return createErrorStream(
        "INVALID_IMAGE_DATA",
        "Error: Image data is missing or invalid for vision processing."
     );
  }
  
  const imagePart = {
    inlineData: {
      mimeType: imageFile.type,
      data: imageFile.base64Data,
    },
  };
  const textPart: Part = { text: newUserMessageText };

  const contents: Content[] = [
    { role: 'user', parts: [textPart, imagePart] }, 
  ];

  try {
    const stream = await ai.models.generateContentStream({
      model: GEMINI_VISION_MODEL, 
      contents: contents,
      config: {
        systemInstruction: documentAnalysisSystemInstructionText,
      }
    });
    return stream;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Gemini vision stream error.";
    return createErrorStream(errorMessage, `Sorry, I encountered an error processing the image: ${errorMessage}`);
  }
};


export const getDocumentAnalysisQnAStream = async (
  question: string,
  imageFile: UploadedFile,
  chatHistory: DocumentAnalysisMessage[] 
): Promise<AsyncIterable<GenerateContentResponse>> => {
  if (!process.env.API_KEY) {
    return createErrorStream(
        "API_KEY_MISSING",
        "Error: Google GenAI API key is not configured. Document Q&A is unavailable."
    );
  }
   if (!imageFile || !imageFile.base64Data || !imageFile.type) {
     return createErrorStream(
        "INVALID_IMAGE_DATA",
        "Error: Image data is missing or invalid for Q&A processing."
     );
  }

  const imagePart = { inlineData: { mimeType: imageFile.type, data: imageFile.base64Data } };
  const geminiHistory = transformDocumentMessagesForGemini(chatHistory);

  const contents: Content[] = [
    { role: 'user', parts: [imagePart, {text: "This is the document we are discussing."}] }, 
    ...geminiHistory,
    { role: 'user', parts: [{ text: question }] }
  ];
  
  try {
    const stream = await ai.models.generateContentStream({
      model: GEMINI_VISION_MODEL,
      contents: contents,
      config: {
        systemInstruction: documentAnalysisSystemInstructionText,
      }
    });
    return stream;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Gemini vision Q&A stream error.";
    return createErrorStream(errorMessage, `Sorry, I encountered an error answering your question about the document: ${errorMessage}`);
  }
};

export const transcribeAudioWithGemini = async (
  audioBase64: string,
  audioMimeType: string, // e.g., 'audio/wav', 'audio/webm'
  languageCode: string // BCP-47 language code, e.g., 'en-US', 'hi-IN'
): Promise<string | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY_MISSING for transcribeAudioWithGemini");
    throw new Error("API key not configured for transcription.");
  }
  if (!audioBase64 || !audioMimeType) {
    console.error("Invalid audio data for transcription.");
    throw new Error("Invalid audio data for transcription.");
  }

  const audioPart: Part = {
    inlineData: {
      mimeType: audioMimeType,
      data: audioBase64,
    },
  };
  const textPart: Part = {
    text: `Transcribe this audio accurately. The language spoken is ${languageCode}. Provide only the transcription text.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_VISION_MODEL, // Multimodal model
      contents: [{ role: 'user', parts: [audioPart, textPart] }],
      config: {
        // No specific system instruction needed as prompt is direct.
        // Temperature might be set low for more factual transcription
        temperature: 0.2, 
      }
    });
    
    // Log the full response for debugging if needed
    // console.log("Gemini STT Full Response:", JSON.stringify(response, null, 2));

    if (response.text) {
      return response.text.trim();
    }
    console.warn("Gemini STT: Transcription result is empty.", response);
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Gemini STT error.";
    console.error("Error in transcribeAudioWithGemini:", errorMessage, error);
    throw new Error(`Failed to transcribe audio: ${errorMessage}`);
  }
};


export const translateTextWithGemini = async (
  text: string,
  targetLanguage: string, // BCP-47 e.g., 'hi'
  sourceLanguage: string  // BCP-47 e.g., 'en'
): Promise<string | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY_MISSING for translateTextWithGemini");
    throw new Error("API key not configured for translation.");
  }
  if (!text || !targetLanguage || !sourceLanguage) {
    console.error("Invalid parameters for translation.");
    return text; // Return original text if params are bad
  }
  if (sourceLanguage === targetLanguage) return text;

  const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Output only the translated text, without any additional explanations or context. Text to translate: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      // No specific system instruction needed, prompt is direct.
      // config: { temperature: 0.1 } // Low temperature for more deterministic translation
    });
    
    if (response.text) {
      // Sometimes Gemini might add quotes or prefixes, try to clean common ones.
      let translated = response.text.trim();
      // Remove potential markdown fences for JSON (though not expected here)
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = translated.match(fenceRegex);
      if (match && match[2]) {
        translated = match[2].trim();
      }
      // Remove if model wraps with quotes
      if (translated.startsWith('"') && translated.endsWith('"')) {
        translated = translated.substring(1, translated.length - 1);
      }
      return translated;
    }
    console.warn("Gemini Translate: Translation result is empty.", response);
    return text; // Fallback to original text if translation is empty
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Gemini translation error.";
    console.error(`Error translating text from ${sourceLanguage} to ${targetLanguage}:`, errorMessage, error);
    // Do not throw, return original text as a fallback for UI.
    return text; 
  }
};
