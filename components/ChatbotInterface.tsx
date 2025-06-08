import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  // add more as needed
];

const ChatbotInterface: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substring(2, 15));
  const [inputLan, setInputLan] = useState('en');
  const [outputLan, setOutputLan] = useState('en');
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
  
    setLoading(true);
  
    try {
      // 1. Translate user question to English if needed
      let questionInEnglish = question;
      if (inputLan !== 'en') {
        const translationRes = await axios.post('/api/bhashini/translate', {
          text: question,
          inputLan,
          outputLan: 'en',
        });
        // Extract from Bhashini API response structure
        questionInEnglish = translationRes.data.pipelineResponse?.[0]?.output?.[0]?.target || 
                           translationRes.data.translated_text || 
                           translationRes.data.translation || 
                           question;
      }
  
      // 2. Send translated question to chatbot backend
      const chatRes = await axios.post('/api/chat', {
        question: questionInEnglish,
        session_id: sessionId,
      });
  
      let botResponseEnglish = chatRes.data.reply;
  
      // 3. Translate bot response to outputLan if needed
      let finalBotResponse = botResponseEnglish;
      if (outputLan !== 'en') {
        const backTranslationRes = await axios.post('/api/bhashini/translate', {
          text: botResponseEnglish,
          inputLan: 'en',  // Bot response is in English
          outputLan,       // Translate to user's desired output language
        });
        // Extract from Bhashini API response structure
        finalBotResponse = backTranslationRes.data.pipelineResponse?.[0]?.output?.[0]?.target || 
                          backTranslationRes.data.translated_text || 
                          backTranslationRes.data.translation || 
                          botResponseEnglish;
      }
  
      // 4. Update messages state
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: question },
        { sender: 'bot', text: finalBotResponse },
      ]);
      setQuestion('');
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: question },
        { sender: 'bot', text: 'Something went wrong. Please try again.' },
      ]);
    }
  
    setLoading(false);
  };

  // Handle translation of last bot message
  const handleTranslate = async () => {
    // Find last bot message index
    const lastBotIndex = [...messages].reverse().findIndex((m) => m.sender === 'bot');
    if (lastBotIndex === -1) {
      alert('No bot message to translate.');
      return;
    }
    // Since we reversed, compute actual index
    const index = messages.length - 1 - lastBotIndex;
    const originalText = messages[index].text;

    setLoading(true);
    try {
      // For manual translation, we need to determine the current language of the bot message
      // and translate it to the desired output language
      const res = await axios.post('/api/bhashini/translate', {
        text: originalText,
        inputLan: 'en', // Assuming bot message is currently in English or previous output language
        outputLan,      // User's desired output language
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Extract from Bhashini API response structure
      const translatedText = res.data.pipelineResponse?.[0]?.output?.[0]?.target || 
                             res.data.translated_text || 
                             res.data.translation || 
                             res.data.reply || 
                             '';

      // Update the bot message with translated text
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[index] = { ...newMessages[index], text: translatedText };
        return newMessages;
      });
    } catch (err) {
      console.error(err);
      alert('Translation failed. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: 8, display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <h2>Legal Awareness Chatbot</h2>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div>
          <label htmlFor="inputLan">Input Language: </label>
          <select
            id="inputLan"
            value={inputLan}
            onChange={(e) => setInputLan(e.target.value)}
            disabled={loading}
          >
            {languageOptions.map((lan) => (
              <option key={lan.code} value={lan.code}>{lan.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="outputLan">Output Language: </label>
          <select
            id="outputLan"
            value={outputLan}
            onChange={(e) => setOutputLan(e.target.value)}
            disabled={loading}
          >
            {languageOptions.map((lan) => (
              <option key={lan.code} value={lan.code}>{lan.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleTranslate}
          disabled={loading || messages.filter(m => m.sender === 'bot').length === 0}
          style={{ padding: '0.3rem 1rem' }}
          title="Translate last bot response"
        >
          Translate
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#fafafa' }}>
        {messages.length === 0 && <p style={{ color: '#777' }}>Ask your legal question below to start the conversation.</p>}

        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '1rem', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: 20,
                backgroundColor: msg.sender === 'user' ? '#007bff' : '#e5e5ea',
                color: msg.sender === 'user' ? 'white' : 'black',
                maxWidth: '75%',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: 20,
                backgroundColor: '#e5e5ea',
                color: 'black',
                maxWidth: '75%',
                fontStyle: 'italic',
                opacity: 0.7,
              }}
            >
              Bot is thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          style={{ flex: 1, padding: '0.5rem', resize: 'none' }}
          placeholder="Type your question here..."
          disabled={loading}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }} disabled={loading || !question.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatbotInterface;