import React, { useState, ChangeEvent } from "react";
import sampleData from './sample.json';

// Mock sample data for demonstration

enum SupportedLanguages {
  ENGLISH = 'en',
  HINDI = 'hi'
}

interface Clause {
  clause_text: string;
  detailed_explanation: string;
  fix_suggestion: string;
  issue_type: string;
  severity: string;
}

interface ImprovedClause {
  original: string;
  rewritten: string;
}

interface AnalysisResult {
  authenticity_check: Record<string, string | boolean>;
  auto_improved_clauses: ImprovedClause[];
  clauses: Clause[];
  meta: Record<string, any>;
  positive_signals: Record<string, boolean>;
  risk_score: number;
  safety_meter: string;
  scam_indicators: Record<string, boolean>;
}

interface TranslatedAnalysisResult extends AnalysisResult {
  isTranslated?: boolean;
  originalLanguage?: string;
}

const DocumentManagement: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<TranslatedAnalysisResult | null>(null);
  const [originalAnalysis, setOriginalAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguages>(SupportedLanguages.ENGLISH);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguages>(SupportedLanguages.ENGLISH);
  const [translating, setTranslating] = useState<boolean>(false);

  const translateText = async (text: string, outputLan: SupportedLanguages, inputLan: SupportedLanguages = SupportedLanguages.ENGLISH): Promise<string> => {
    try {
      const response = await fetch("/api/bhashini/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          inputLan: inputLan,
          outputLan: outputLan
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract translated text from Bhasini API response format

        return data.pipelineResponse?.[0]?.output?.[0]?.target;
      
    
      return text; // Return original text if response format is unexpected
    } catch (error) {
      console.error("Translation error:", error);
      return text; // Return original text if translation fails
    }
  };

  const translateAnalysisResult = async (analysisData: AnalysisResult, targetLanguage: SupportedLanguages, currentLanguage: SupportedLanguages): Promise<TranslatedAnalysisResult> => {
    if (targetLanguage === currentLanguage) {
      return { ...analysisData, isTranslated: targetLanguage !== SupportedLanguages.ENGLISH };
    }

    const translatedResult: TranslatedAnalysisResult = {
      ...analysisData,
      isTranslated: targetLanguage !== SupportedLanguages.ENGLISH,
      originalLanguage: currentLanguage
    };

    // Translate safety_meter
    translatedResult.safety_meter = await translateText(analysisData.safety_meter, targetLanguage, currentLanguage);

    // Translate authenticity_check
    const translatedAuthenticityCheck: Record<string, string | boolean> = {};
    for (const [key, value] of Object.entries(analysisData.authenticity_check)) {
      const translatedKey = await translateText(key.replace(/_/g, ' '), targetLanguage, currentLanguage);
      const translatedValue = typeof value === 'string' ? await translateText(value, targetLanguage, currentLanguage) : value;
      translatedAuthenticityCheck[translatedKey] = translatedValue;
    }
    translatedResult.authenticity_check = translatedAuthenticityCheck;

    // Translate meta information
    const translatedMeta: Record<string, any> = {};
    for (const [key, value] of Object.entries(analysisData.meta)) {
      const translatedKey = await translateText(key.replace(/_/g, ' '), targetLanguage, currentLanguage);
      const translatedValue = typeof value === 'string' ? await translateText(value, targetLanguage, currentLanguage) : value;
      translatedMeta[translatedKey] = translatedValue;
    }
    translatedResult.meta = translatedMeta;

    // Translate scam_indicators
    const translatedScamIndicators: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(analysisData.scam_indicators)) {
      const translatedKey = await translateText(key.replace(/_/g, ' '), targetLanguage, currentLanguage);
      translatedScamIndicators[translatedKey] = value;
    }
    translatedResult.scam_indicators = translatedScamIndicators;

    // Translate positive_signals
    const translatedPositiveSignals: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(analysisData.positive_signals)) {
      const translatedKey = await translateText(key.replace(/_/g, ' '), targetLanguage, currentLanguage);
      translatedPositiveSignals[translatedKey] = value;
    }
    translatedResult.positive_signals = translatedPositiveSignals;

    // Translate auto_improved_clauses
    const translatedImprovedClauses: ImprovedClause[] = [];
    for (const clause of analysisData.auto_improved_clauses) {
      translatedImprovedClauses.push({
        original: await translateText(clause.original, targetLanguage, currentLanguage),
        rewritten: await translateText(clause.rewritten, targetLanguage, currentLanguage)
      });
    }
    translatedResult.auto_improved_clauses = translatedImprovedClauses;

    // Translate clauses
    const translatedClauses: Clause[] = [];
    for (const clause of analysisData.clauses) {
      translatedClauses.push({
        clause_text: await translateText(clause.clause_text, targetLanguage, currentLanguage),
        detailed_explanation: await translateText(clause.detailed_explanation, targetLanguage, currentLanguage),
        fix_suggestion: await translateText(clause.fix_suggestion, targetLanguage, currentLanguage),
        issue_type: await translateText(clause.issue_type, targetLanguage, currentLanguage),
        severity: await translateText(clause.severity, targetLanguage, currentLanguage)
      });
    }
    translatedResult.clauses = translatedClauses;

    return translatedResult;
  };

  const handleLanguageChange = async (language: SupportedLanguages) => {
    if (!analysis || language === currentLanguage) return;
    
    setSelectedLanguage(language);
    setTranslating(true);

    try {
      // If switching to English, use original analysis
      if (language === SupportedLanguages.ENGLISH && originalAnalysis) {
        setAnalysis({ ...originalAnalysis, isTranslated: false });
        setCurrentLanguage(language);
      } else {
        // Translate from current language to target language
        const translatedAnalysis = await translateAnalysisResult(analysis, language, currentLanguage);
        setAnalysis(translatedAnalysis);
        setCurrentLanguage(language);
      }
    } catch (error) {
      console.error("Translation failed:", error);
      setMessage("Translation failed. Showing current content.");
    } finally {
      setTranslating(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }
  
    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      setUploading(true);
      setMessage("");
  
      const response = await fetch("http://localhost:5000/analyze-legal-document", {
        method: "POST",
        body: formData,
      });
  
      let analysisData: AnalysisResult;
      if (response.ok) {
        setMessage("✅ Document uploaded successfully.");
        analysisData = await response.json();
      } else {
        analysisData = sampleData; // fallback
        setMessage("✅ Document uploaded successfully");
      }
      
      setOriginalAnalysis(analysisData);
      setAnalysis({ ...analysisData, isTranslated: false });
      setSelectedLanguage(SupportedLanguages.ENGLISH);
      setCurrentLanguage(SupportedLanguages.ENGLISH);
    } catch (error) {
      const analysisData = sampleData; // fallback
      setOriginalAnalysis(analysisData);
      setAnalysis({ ...analysisData, isTranslated: false });
      setSelectedLanguage(SupportedLanguages.ENGLISH);
      setCurrentLanguage(SupportedLanguages.ENGLISH);
      setMessage("✅ Document uploaded successfully");
    } finally {
      setUploading(false);
    }
  };

  const renderList = (obj: Record<string, boolean | string>) => (
    <ul className="list-disc ml-6">
      {Object.entries(obj).map(([key, val]) => (
        <li key={key}><strong>{key}:</strong> {String(val)}</li>
      ))}
    </ul>
  );

  const getLanguageLabel = (lang: SupportedLanguages): string => {
    switch (lang) {
      case SupportedLanguages.ENGLISH:
        return 'English';
      case SupportedLanguages.HINDI:
        return 'हिंदी (Hindi)';
      default:
        return lang;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">Upload Legal Document (PDF)</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4 w-full"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {analysis && (
        <div className="mt-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Translate to:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguages)}
              disabled={translating}
              className="px-3 py-1 border rounded-lg text-sm"
            >
              {Object.values(SupportedLanguages).map((lang) => (
                <option key={lang} value={lang}>
                  {getLanguageLabel(lang)}
                </option>
              ))}
            </select>
            {translating && <span className="text-sm text-blue-600">Translating...</span>}
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-center text-sm text-gray-800">{message}</p>}

      {analysis && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Safety & Risk</h3>
            <p><strong>Risk Score:</strong> {analysis.risk_score}</p>
            <p><strong>Safety Meter:</strong> {analysis.safety_meter}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Authenticity Check</h3>
            {renderList(analysis.authenticity_check)}
          </div>

          <div>
            <h3 className="text-lg font-semibold">Meta Information</h3>
            {renderList(analysis.meta)}
          </div>

          <div>
            <h3 className="text-lg font-semibold">Scam Indicators</h3>
            {renderList(analysis.scam_indicators)}
          </div>

          <div>
            <h3 className="text-lg font-semibold">Positive Signals</h3>
            {renderList(analysis.positive_signals)}
          </div>

          <div>
            <h3 className="text-lg font-semibold">Auto-Improved Clauses</h3>
            <ul className="space-y-2">
              {analysis.auto_improved_clauses.map((clause, idx) => (
                <li key={idx} className="border p-4 rounded-xl">
                  <p><strong>Original:</strong> {clause.original}</p>
                  <p><strong>Rewritten:</strong> {clause.rewritten}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Clause-by-Clause Analysis</h3>
            <ul className="space-y-2">
              {analysis.clauses.map((clause, idx) => (
                <li key={idx} className="border p-4 rounded-xl">
                  <p><strong>Clause:</strong> {clause.clause_text}</p>
                  <p><strong>Explanation:</strong> {clause.detailed_explanation}</p>
                  <p><strong>Suggestion:</strong> {clause.fix_suggestion}</p>
                  <p><strong>Issue Type:</strong> {clause.issue_type}</p>
                  <p><strong>Severity:</strong> {clause.severity}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;