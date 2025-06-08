import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { ChatMessage } from '../types';
import { getGeminiStreamedResponse, transcribeAudioWithGemini } from '../services/geminiService.ts'; 
import { detectTextLanguage } from '../services/bhashiniService'; // Keep for input language detection
// Removed Bhashini translate, textToSpeech, speechToTextBhashini
import Button from './common/Button';
import Input from './common/Input';
import { UserIcon } from './icons/UserIcon';
import { LogoIcon } from './icons/LogoIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopCircleIcon } from './icons/StopCircleIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { useLanguage } from '../context/LanguageContext';
import { textToSpeech as bhashiniTextToSpeech } from '../services/bhashiniService'; // Keep bhashini TTS for now, or replace if Gemini TTS also required

const ChatbotInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentLanguage: appLanguage, translate } = useLanguage(); 

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [userInputLanguage, setUserInputLanguage] = useState<string>('en'); 
  const [isBotSpeaking, setIsBotSpeaking] = useState<string | null>(null);

  useEffect(() => {
    const setInitialMsg = async () => {
        const initialText = await translate('Hello! I am Nyay Sahayak, your AI legal assistant for Indian law. How can I help you today?');
        setMessages([
          {
            id: 'initial-bot-message',
            text: initialText,
            sender: 'bot',
            timestamp: new Date(),
            language: appLanguage, 
          },
        ]);
    };
    setInitialMsg();
  }, [appLanguage, translate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    if (isRecording || isProcessingAudio) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Try to get WAV if possible, otherwise browser default (often webm)
      const options = { mimeType: 'audio/wav' }; 
      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (e) {
        console.warn("WAV mimeType not supported for MediaRecorder, using browser default.", e);
        mediaRecorderRef.current = new MediaRecorder(stream); // Fallback to browser default
      }
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessingAudio(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        const sttLanguage = userInputLanguage || appLanguage || 'en';
        
        try {
          const audioBase64 = await convertBlobToBase64(audioBlob);
          const transcribedText = await transcribeAudioWithGemini(audioBase64, audioBlob.type, sttLanguage);

          if (transcribedText) {
            setCurrentMessage(transcribedText);
            const detectedLang = await detectTextLanguage(transcribedText); // Bhashini detect for input context
            setUserInputLanguage(detectedLang || sttLanguage);
            if (transcribedText.trim()) {
                handleSendMessage(undefined, transcribedText, detectedLang || sttLanguage);
            }
          } else {
            setError("Gemini STT: No text transcribed or STT failed.");
          }
        } catch (sttError) {
          console.error("Gemini STT error:", sttError);
          setError(sttError instanceof Error ? `STT Error: ${sttError.message}` : "STT failed. Please try again.");
        } finally {
          setIsProcessingAudio(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Microphone access denied or error starting recording. Please check permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false); 
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleSendMessage = async (e?: FormEvent, messageTextOverride?: string, detectedLangOverride?: string) => {
    if (e) e.preventDefault();
    
    const messageToSend = messageTextOverride || currentMessage;
    if (!messageToSend.trim() || isLoading || isProcessingAudio) return;

    if (isRecording) stopRecording();

    let finalUserInputLanguage = detectedLangOverride || userInputLanguage || 'en';
    if (!messageTextOverride && messageToSend.trim()) { 
        try {
            const detectedTypedLang = await detectTextLanguage(messageToSend); // Bhashini detect
            setUserInputLanguage(detectedTypedLang || 'en'); // Ensure it's never undefined
            finalUserInputLanguage = detectedTypedLang || 'en';
        } catch (typedLangError){ finalUserInputLanguage = userInputLanguage || 'en'; }
    }


    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date(),
      language: finalUserInputLanguage,
    };

    const historyForAPI = [...messages, userMessage];
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setError(null);

    const botMessagePlaceholderId = `bot-${Date.now()}`;
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: botMessagePlaceholderId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
        isLoading: true,
        language: appLanguage, 
      },
    ]);

    try {
      const stream = await getGeminiStreamedResponse(historyForAPI, messageToSend);
      let rawBotResponse = '';
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          rawBotResponse += chunkText;
          // Translate chunk by chunk if possible, or translate whole response at the end.
          // For now, accumulating then translating.
          const translatedChunkPreview = await translate(rawBotResponse); // Translate accumulated
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === botMessagePlaceholderId
                ? { ...msg, text: translatedChunkPreview, isLoading: true } 
                : msg
            )
          );
        }
      }
      
      // Final translation of the complete response
      const finalBotText = await translate(rawBotResponse);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessagePlaceholderId
            ? { ...msg, text: finalBotText, isLoading: false, language: appLanguage } // Bot response is in appLanguage
            : msg
        )
      );

    } catch (err) {
      console.error('Error in handleSendMessage (Gemini Chat):', err);
      const errorMessageText = err instanceof Error ? err.message : 'An unknown error occurred with the AI.';
      setError(`AI interaction error: ${errorMessageText}`);
      const translatedError = await translate(`Sorry, error: ${errorMessageText}`);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessagePlaceholderId
            ? { ...msg, text: translatedError, isLoading: false, language: appLanguage, sender: 'bot' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessagePlaceholderId && msg.isLoading
            ? { ...msg, isLoading: false }
            : msg
        )
      );
    }
  };

  const playBotTTS = async (message: ChatMessage) => {
    if (!message.text || isBotSpeaking === message.id || isProcessingAudio) return;
    setIsBotSpeaking(message.id);
    setError(null);
    try {
      // Using Bhashini TTS for now. If Gemini TTS is required, this needs changing.
      const audioBase64 = await bhashiniTextToSpeech(message.text, message.language || appLanguage);
      if (audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        audio.play();
        audio.onended = () => setIsBotSpeaking(null);
        audio.onerror = () => {
            setError("Error playing audio.");
            setIsBotSpeaking(null);
        }
      } else {
        setError("Could not generate audio for this message.");
        setIsBotSpeaking(null);
      }
    } catch (ttsError) {
      console.error("TTS Error:", ttsError);
      setError(ttsError instanceof Error ? ttsError.message : "Failed to play audio.");
      setIsBotSpeaking(null);
    }
  };
  
  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group animate-slideInLeft hover-scale`} 
           style={{ animationDelay: '0.1s' }}>
        {!isUser && (
           <LogoIcon className="w-8 h-8 rounded-full mr-3 flex-shrink-0 text-primary self-start mt-1 shadow-sm" />
        )}
        <div
          className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow-md ${
            isUser
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-white text-darktext rounded-bl-none border border-gray-200'
          }`}
        >
          {message.isLoading && !message.text ? (
             <div className="flex items-center space-x-2">
                <SpinnerIcon className="w-5 h-5 animate-spin text-primary" /> 
                <span className="text-sm text-mediumtext">Nyay Sahayak is thinking...</span>
             </div>
          ) : (
            message.text.split('\n').map((line, index) => (
              <p key={index} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))
          )}
          {message.isLoading && message.text && <SpinnerIcon className="w-4 h-4 animate-spin inline-block ml-2 text-gray-400" />}
        </div>
        {!isUser && message.text && !message.isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => playBotTTS(message)}
            className="ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 self-center"
            aria-label="Play message audio"
            isLoading={isBotSpeaking === message.id}
            disabled={isBotSpeaking !== null && isBotSpeaking !== message.id}
          >
            <SpeakerWaveIcon className="w-5 h-5 text-primary" />
          </Button>
        )}
         {isUser && (
           <UserIcon className="w-8 h-8 rounded-full ml-3 flex-shrink-0 text-white bg-primary p-1 self-start mt-1 shadow-sm" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-1px)] max-h-[calc(100vh-4rem-1px)] bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
      <header className="bg-primary text-white p-4 flex items-center justify-between shadow-md animate-slideInDown">
        <h2 className="text-xl font-semibold">AI Legal Assistant</h2>
        <span className="text-xs px-2 py-1 bg-white/20 rounded-full">{appLanguage.toUpperCase()} Mode</span>
      </header>

      {error && (
         <div className="p-3 bg-red-100 text-red-700 border-b border-red-200 text-sm text-center">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 font-bold">X</button>
         </div>
      )}

      <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-transparent animate-fadeIn">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white/80 backdrop-blur-sm animate-slideInUp">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Input
            type="text"
            value={currentMessage}
            onChange={async (e) => {
              setCurrentMessage(e.target.value);
              if (e.target.value.length > 5 && e.target.value.includes(' ')) { 
                  try {
                      const detectedLang = await detectTextLanguage(e.target.value); // Bhashini detect
                      setUserInputLanguage(detectedLang || appLanguage);
                  } catch (langError) { setUserInputLanguage(appLanguage); }
              } else if (!e.target.value.trim()) {
                  setUserInputLanguage(appLanguage); 
              }
            }}
            placeholder={isRecording ? "Recording..." : isProcessingAudio ? "Processing audio..." : "Ask about Indian law..."}
            className="flex-grow !mb-0"
            disabled={isLoading || isRecording || isProcessingAudio}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSendMessage();
                e.preventDefault(); 
              }
            }}
          />
          <Button
            type="button"
            variant={isRecording ? "danger" : "ghost"}
            onClick={toggleRecording}
            disabled={isLoading || isProcessingAudio}
            className={`p-2.5 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'text-primary hover:bg-blue-100'} ${isProcessingAudio ? 'cursor-wait' : ''}`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isProcessingAudio ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : (isRecording ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />) }
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={!currentMessage.trim() || isRecording || isProcessingAudio}>
            Send
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1 pl-1">
            Input Language: {(userInputLanguage || appLanguage).toUpperCase()}
            {isProcessingAudio ? " (Processing...)" : isRecording ? " (Recording...)" : ""}
        </p>
      </form>
    </div>
  );
};

export default ChatbotInterface;
