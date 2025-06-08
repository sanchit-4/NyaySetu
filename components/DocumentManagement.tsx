
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DocumentIcon } from './icons/DocumentIcon';
import { UploadIcon } from './icons/UploadIcon'; // Create this icon
import { XCircleIcon } from './icons/XCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon'; // Create this icon
import Button from './common/Button';
import Input from './common/Input';
import { UploadedFile, DocumentAnalysisMessage } from '../types';
import { generateContentWithImage, getDocumentAnalysisQnAStream } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { LogoIcon } from './icons/LogoIcon';
import { UserIcon } from './icons/UserIcon';


const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const DocumentManagement: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [qnaMessages, setQnAMessages] = useState<DocumentAnalysisMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingQnA, setIsLoadingQnA] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qnaEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    qnaEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qnaMessages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setSummary('');
    setQnAMessages([]);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Max size: ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(`Invalid file type. Allowed types: JPG, PNG, WebP.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const newFile: UploadedFile = {
        name: file.name,
        type: file.type,
        base64Data,
        size: file.size,
        objectURL: URL.createObjectURL(file),
      };
      setUploadedFile(newFile);
      // Automatically trigger summarization
      await handleSummarize(newFile);
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSummarize = async (fileToSummarize?: UploadedFile) => {
    const currentFile = fileToSummarize || uploadedFile;
    if (!currentFile) {
      setError("No file uploaded to summarize.");
      return;
    }
    setIsLoadingSummary(true);
    setSummary('');
    setError(null);
    setQnAMessages([]); // Clear previous QnA

    try {
      const stream = await generateContentWithImage("Summarize this document based on the image provided. Focus on key details, purpose, parties involved if any, and any notable legal aspects or obligations mentioned.", currentFile);
      let fullSummary = "";
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullSummary += chunkText;
          setSummary(fullSummary); // Live update
        }
      }
      setQnAMessages(prev => [...prev, {id: `summary-${Date.now()}`, text: fullSummary, sender: 'bot', timestamp: new Date(), isSummary: true}]);

    } catch (err) {
      console.error("Error summarizing document:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to summarize document.";
      setError(errorMsg);
      setSummary(`Error: ${errorMsg}`);
    } finally {
      setIsLoadingSummary(false);
    }
  };
  
  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuestion.trim() || !uploadedFile || isLoadingQnA) return;

    const userQMessage: DocumentAnalysisMessage = {
      id: `user-q-${Date.now()}`,
      text: currentQuestion,
      sender: 'user',
      timestamp: new Date(),
    };
    setQnAMessages(prev => [...prev, userQMessage]);
    setCurrentQuestion('');
    setIsLoadingQnA(true);
    setError(null);
    
    const botAnsweringPlaceholderId = `bot-ans-${Date.now()}`;
     setQnAMessages((prevMessages) => [
      ...prevMessages,
      {
        id: botAnsweringPlaceholderId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
        isLoading: true,
      },
    ]);

    try {
      // Pass relevant QnA history for context (e.g., last few messages, or just summary + new question)
      // For simplicity here, we'll pass the current messages which includes summary and previous Qs.
      // Be mindful of token limits with very long histories.
      const stream = await getDocumentAnalysisQnAStream(userQMessage.text, uploadedFile, qnaMessages);
      let fullAnswer = "";
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullAnswer += chunkText;
          setQnAMessages((prev) =>
            prev.map((msg) =>
              msg.id === botAnsweringPlaceholderId
                ? { ...msg, text: fullAnswer, isLoading: true }
                : msg
            )
          );
        }
      }
      setQnAMessages((prev) =>
        prev.map((msg) =>
          msg.id === botAnsweringPlaceholderId
            ? { ...msg, text: fullAnswer, isLoading: false }
            : msg
        )
      );

    } catch (err) {
      console.error("Error answering question:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to get answer.";
      setError(errorMsg);
       setQnAMessages((prev) =>
        prev.map((msg) =>
          msg.id === botAnsweringPlaceholderId
            ? { ...msg, text: `Error: ${errorMsg}`, isLoading: false }
            : msg
        )
      );
    } finally {
      setIsLoadingQnA(false);
    }
  };


  const clearFile = () => {
    if (uploadedFile?.objectURL) {
      URL.revokeObjectURL(uploadedFile.objectURL);
    }
    setUploadedFile(null);
    setSummary('');
    setQnAMessages([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };
  
  const MessageBubble: React.FC<{ message: DocumentAnalysisMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const isBotSummary = message.sender === 'bot' && message.isSummary;

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 group animate-fadeIn`}>
        {!isUser && (
           <LogoIcon className={`w-7 h-7 rounded-full mr-2.5 flex-shrink-0 text-primary self-start mt-1 shadow-sm ${isBotSummary ? 'text-secondary' : 'text-primary'}`} />
        )}
        <div
          className={`max-w-md lg:max-w-lg px-3.5 py-2.5 rounded-lg shadow-sm ${
            isUser
              ? 'bg-primary text-white rounded-br-none'
              : `bg-white text-darktext rounded-bl-none border ${isBotSummary ? 'border-secondary/50' : 'border-gray-200'}`
          }`}
        >
          {message.isLoading && !message.text ? (
             <div className="flex items-center space-x-1.5">
                <SpinnerIcon className="w-4 h-4 animate-spin text-primary" /> 
                <span className="text-xs text-mediumtext">Thinking...</span>
             </div>
          ) : (
            message.text.split('\n').map((line, index) => (
              <p key={index} className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))
          )}
          {message.isLoading && message.text && <SpinnerIcon className="w-3 h-3 animate-spin inline-block ml-1.5 text-gray-400" />}
        </div>
         {isUser && (
           <UserIcon className="w-7 h-7 rounded-full ml-2.5 flex-shrink-0 text-white bg-primary p-0.5 self-start mt-1 shadow-sm" />
        )}
      </div>
    );
  };


  return (
    <div className="animate-fadeIn p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-blue-100 min-h-[calc(100vh-4rem-1px)]">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <DocumentIcon className="w-9 h-9 sm:w-10 sm:h-10 text-primary mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-darktext">Document Analyzer</h1>
        </div>
        {uploadedFile && (
             <Button onClick={clearFile} variant="danger" size="sm" leftIcon={<XCircleIcon className="w-4 h-4"/>}>Clear Document</Button>
        )}
      </header>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 font-bold">X</button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Upload and Preview */}
        <div className="bg-white p-5 rounded-xl shadow-xl space-y-5">
          {!uploadedFile ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors h-96">
              <UploadIcon className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-darktext mb-2">Upload Document Image</h2>
              <p className="text-mediumtext text-sm mb-4 text-center">Drag & drop or click to select a JPG, PNG, or WebP file (Max {MAX_FILE_SIZE_MB}MB).</p>
              <Button onClick={() => fileInputRef.current?.click()} variant="secondary" leftIcon={<UploadIcon className="w-5 h-5"/>}>
                Select File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={ALLOWED_MIME_TYPES.join(',')}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-darktext">Document Preview</h2>
              <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm max-h-96 flex justify-center items-center bg-gray-100">
                <img src={uploadedFile.objectURL} alt={uploadedFile.name} className="max-w-full max-h-96 object-contain" />
              </div>
              <p className="text-xs text-mediumtext">File: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
            </div>
          )}
        </div>

        {/* Right Column: Summary and Q&A */}
        <div className="bg-white p-5 rounded-xl shadow-xl flex flex-col max-h-[calc(100vh-8rem)]">
          {!uploadedFile ? (
             <div className="flex flex-col items-center justify-center text-center text-mediumtext p-10 h-full">
                <SparklesIcon className="w-12 h-12 text-gray-300 mb-3"/>
                <p>Upload a document image to get an AI-powered summary and ask questions about its content.</p>
            </div>
          ) : (
            <>
              {/* Summary Section */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-darktext mb-2 flex items-center">
                  <SparklesIcon className="w-6 h-6 text-secondary mr-2" />
                  AI Summary
                </h2>
                {isLoadingSummary && !summary && (
                  <div className="flex items-center text-mediumtext">
                    <SpinnerIcon className="w-5 h-5 animate-spin mr-2" /> Generating summary...
                  </div>
                )}
                {summary && !isLoadingSummary && qnaMessages.find(m => m.isSummary) && (
                  <div className="text-sm text-darktext bg-green-50 p-3 rounded-md border border-green-200 max-h-40 overflow-y-auto prose prose-sm">
                    {qnaMessages.find(m => m.isSummary)?.text?.split('\n').map((line, index) => (
                      <p key={index} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ))}
                  </div>
                )}
                {!isLoadingSummary && !summary && !error && uploadedFile && (
                    <p className="text-sm text-mediumtext">Summary will appear here.</p>
                )}
              </div>
              
              {/* Q&A Section */}
              <div className="flex-grow overflow-y-auto mb-3 pr-2 space-y-1_5">
                 {qnaMessages.filter(m => !m.isSummary).map((msg) => ( // Filter out the summary from chat display
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={qnaEndRef}></div>
              </div>
              
              <form onSubmit={handleAskQuestion} className="mt-auto pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Ask a question about the document..."
                    className="flex-grow !mb-0 text-sm"
                    disabled={isLoadingQnA || isLoadingSummary || !uploadedFile}
                  />
                  <Button type="submit" variant="primary" size="sm" isLoading={isLoadingQnA} disabled={!currentQuestion.trim() || isLoadingSummary || !uploadedFile}>
                    Ask
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;
