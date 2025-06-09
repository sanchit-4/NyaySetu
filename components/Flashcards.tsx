import React, { useState, useEffect } from "react";
import {
  Mail,
  Share2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
} from "lucide-react";

// TypeScript interfaces
interface Flashcard {
  id: string;
  title: string;
  content: string;
  answer: string;
}

interface TranslatedFlashcard extends Flashcard {
  translatedTitle?: string;
  translatedContent?: string;
  translatedAnswer?: string;
}

interface ShareForm {
  sender: string;
  recipient: string;
}

interface ApiResponse {
  status: "success" | "error";
  message?: string;
  content?: Flashcard;
  reward?: number;
}

interface FlashcardsProps {
  apiBaseUrl?: string;
}

interface Language {
  code: string;
  name: string;
}

const Flashcards: React.FC<FlashcardsProps> = ({ apiBaseUrl = "" }) => {
  const [flashcards, setFlashcards] = useState<TranslatedFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareForm, setShareForm] = useState<ShareForm>({
    sender: "",
    recipient: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [showLanguageDropdown, setShowLanguageDropdown] =
    useState<boolean>(false);
  const [translating, setTranslating] = useState<boolean>(false);

  const languages: Language[] = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "te", name: "Telugu" },
    { code: "ta", name: "Tamil" },
    { code: "gu", name: "Gujarati" },
    { code: "mr", name: "Marathi" },
    { code: "kn", name: "Kannada" },
  ];

  // Indian Law flashcards focusing on common misconceptions
  const sampleFlashcards: Flashcard[] = [
    {
      id: "law1",
      title: "Police Detention Rights",
      content:
        "MISCONCEPTION: Police can detain you for 24 hours without any reason",
      answer:
        "FACT: Police cannot detain anyone without reasonable suspicion. Under Section 41 CrPC, detention requires specific grounds. You have the right to know the reason for detention and the right to inform someone about your arrest.",
    },
    {
      id: "law2",
      title: "Right to Remain Silent",
      content:
        "MISCONCEPTION: You must answer all police questions during interrogation",
      answer:
        "FACT: Article 20(3) of the Constitution guarantees that no person can be compelled to be a witness against themselves. You have the right to remain silent and the right to legal counsel during interrogation.",
    },
    {
      id: "law3",
      title: "Arrest Procedures",
      content:
        "MISCONCEPTION: Police can arrest you without a warrant for any offense",
      answer:
        "FACT: For non-cognizable offenses, police generally need a warrant. For cognizable offenses, arrest without warrant is allowed only with reasonable suspicion. Section 41A CrPC mandates issuing notice for minor offenses instead of arrest.",
    },
    {
      id: "law4",
      title: "Dowry Law Misconception",
      content:
        "MISCONCEPTION: Section 498A IPC is always misused and leads to automatic arrest",
      answer:
        "FACT: Supreme Court in Rajesh Sharma v. State of UP (2017) mandated that no automatic arrests should be made. A preliminary inquiry and family welfare committee review is required before arrest in 498A cases.",
    },
    {
      id: "law5",
      title: "Property Rights of Women",
      content:
        "MISCONCEPTION: Women have no inheritance rights in ancestral property",
      answer:
        "FACT: Hindu Succession (Amendment) Act 2005 grants daughters equal rights as sons in ancestral property. Married women retain rights in both parental and in-laws property. Muslim women have specific inheritance rights under Muslim Personal Law.",
    },
    {
      id: "law6",
      title: "Consumer Protection",
      content:
        "MISCONCEPTION: You cannot return defective products after purchase",
      answer:
        "FACT: Consumer Protection Act 2019 provides right to return defective goods, seek refund/replacement, and claim compensation. You have 30 days to file complaint for defective products, 2 years for deficient services.",
    },
    {
      id: "law7",
      title: "Employment Rights",
      content:
        "MISCONCEPTION: Private companies can fire employees without notice or compensation",
      answer:
        "FACT: Industrial Disputes Act requires 30 days notice or pay in lieu for termination. Employees with 5+ years service need government approval for retrenchment. Wrongful termination can be challenged in labor courts.",
    },
    {
      id: "law8",
      title: "Self-Defense Laws",
      content:
        "MISCONCEPTION: Self-defense always requires you to retreat first",
      answer:
        "FACT: Section 96-106 IPC allows right of private defense without duty to retreat. You can defend yourself, others, and property using reasonable force. However, force used must be proportional to the threat faced.",
    },
    {
      id: "law9",
      title: "Cybercrime Reporting",
      content:
        "MISCONCEPTION: Cyber crimes can only be reported in the state where the server is located",
      answer:
        "FACT: Under Section 65B of IT Act, cyber crimes can be reported at any police station in India regardless of where the server is located. The principle is that crime can be investigated where it affects the victim.",
    },
    {
      id: "law10",
      title: "Tenant Rights",
      content:
        "MISCONCEPTION: Landlords can evict tenants anytime without legal process",
      answer:
        "FACT: Rent Control Acts in various states protect tenants from arbitrary eviction. Landlords must follow legal procedures, provide proper notice, and can evict only for specific grounds like non-payment, misuse, or personal necessity.",
    },
  ];

  const translateText = async (
    text: string,
    targetLanguage: string
  ): Promise<string> => {
    if (targetLanguage === "en") {
      return text; // No translation needed for English
    }

    try {
      const response = await fetch("api/bhashini/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          inputLan: "en",
          outputLan: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Assuming the API returns translated text in a specific format
      // Adjust this based on your actual API response structure
      const translatedText =
        data.pipelineResponse?.[0]?.output?.[0]?.target ||
        data.translatedText ||
        data.output ||
        text; // Fallback to original text

      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error("Failed to translate text");
    }
  };

  const translateFlashcards = async (targetLanguage: string): Promise<void> => {
    if (targetLanguage === "en") {
      // Reset to original English content
      setFlashcards(sampleFlashcards.map((card) => ({ ...card })));
      return;
    }

    setTranslating(true);
    try {
      const translatedCards = await Promise.all(
        sampleFlashcards.map(async (card) => {
          const [translatedTitle, translatedContent, translatedAnswer] =
            await Promise.all([
              translateText(card.title, targetLanguage),
              translateText(card.content, targetLanguage),
              translateText(card.answer, targetLanguage),
            ]);

          return {
            ...card,
            translatedTitle,
            translatedContent,
            translatedAnswer,
          };
        })
      );

      setFlashcards(translatedCards);
    } catch (error) {
      console.error("Translation failed:", error);
      setMessage("Translation failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  const handleLanguageChange = async (languageCode: string): Promise<void> => {
    setSelectedLanguage(languageCode);
    setShowLanguageDropdown(false);
    await translateFlashcards(languageCode);
  };

  useEffect(() => {
    // Initialize with sample data
    setFlashcards(sampleFlashcards);
  }, []);

  // Function to fetch content from your backend
  const fetchContent = async (contentId: string): Promise<Flashcard | null> => {
    try {
      const response = await fetch(`${apiBaseUrl}/get-content/${contentId}`);
      const data: ApiResponse = await response.json();

      if (data.status === "success" && data.content) {
        return data.content;
      }
      throw new Error(data.message || "Failed to fetch content");
    } catch (error) {
      console.error("Error fetching content:", error);
      return null;
    }
  };

  // Function to share content via your backend
  const shareContent = async (): Promise<void> => {
    if (!shareForm.sender || !shareForm.recipient) {
      setMessage("Please fill in both sender and recipient emails");
      return;
    }

    if (!isValidEmail(shareForm.sender) || !isValidEmail(shareForm.recipient)) {
      setMessage("Please enter valid email addresses");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/share-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: shareForm.sender,
          recipient: shareForm.recipient,
          content_id: flashcards[currentIndex].id,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.status === "success") {
        setMessage(
          `✅ ${data.message} ${
            data.reward ? `You earned ${data.reward} points!` : ""
          }`
        );
        setShowShareModal(false);
        setShareForm({ sender: "", recipient: "" });
      } else {
        setMessage(`❌ ${data.message || "Failed to share content"}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessage(`❌ Failed to share: ${errorMessage}`);
    }
    setLoading(false);
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const nextCard = (): void => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevCard = (): void => {
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
    setIsFlipped(false);
  };

  const flipCard = (): void => {
    setIsFlipped(!isFlipped);
  };

  const handleShareFormChange =
    (field: keyof ShareForm) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setShareForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const clearMessage = (): void => {
    setMessage("");
  };

  const currentCard: TranslatedFlashcard | undefined = flashcards[currentIndex];
  const selectedLang = languages.find((lang) => lang.code === selectedLanguage);

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="text-white text-xl">Loading flashcards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              disabled={translating}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full transition-all duration-200 disabled:opacity-50"
              aria-label="Select language"
            >
              <Globe className="w-4 h-4" />
              <span>
                {translating
                  ? "Translating..."
                  : selectedLang?.name || "English"}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showLanguageDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-50 min-w-[160px]">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      selectedLanguage === language.code
                        ? "bg-purple-50 text-purple-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {language.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Indian Laws Facts check
          </h1>
          <p className="text-white/80">
            Busting Common Legal Misconceptions in India
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg text-white text-center">
            {message}
            <button
              onClick={clearMessage}
              className="ml-2 text-white/60 hover:text-white"
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Flashcard */}
        <div className="relative mb-8">
          <div className="perspective-1000">
            <div
              className={`relative w-full h-80 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              onClick={flipCard}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  flipCard();
                }
              }}
              aria-label={`Flashcard ${currentIndex + 1} of ${
                flashcards.length
              }. Click to flip.`}
            >
              {/* Front of card */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-2xl p-8 flex flex-col justify-center items-center">
                <div className="text-sm font-semibold text-red-600 mb-4 uppercase tracking-wide">
                  {selectedLanguage === "en"
                    ? currentCard.title
                    : currentCard.translatedTitle || currentCard.title}
                </div>
                <div className="text-xl font-bold text-gray-800 text-center mb-6 leading-relaxed">
                  {selectedLanguage === "en"
                    ? currentCard.content
                    : currentCard.translatedContent || currentCard.content}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Click to reveal the legal fact
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-2xl p-8 flex flex-col justify-center items-center text-white">
                <div className="text-sm font-semibold mb-4 uppercase tracking-wide opacity-80">
                  Legal Reality
                </div>
                <div className="text-lg font-medium text-center mb-6 leading-relaxed">
                  {selectedLanguage === "en"
                    ? currentCard.answer
                    : currentCard.translatedAnswer || currentCard.answer}
                </div>
                <div className="flex items-center text-white/70 text-sm">
                  <EyeOff className="w-4 h-4 mr-2" />
                  Click to see misconception again
                </div>
              </div>
            </div>
          </div>

          {/* Card counter */}
          <div className="absolute -top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white font-medium">
            {currentIndex + 1} / {flashcards.length}
          </div>
        </div>

        {/* Navigation and Actions */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={prevCard}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
            aria-label="Previous flashcard"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-4">
            <button
              onClick={flipCard}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
              aria-label="Flip flashcard"
            >
              <RotateCcw className="w-5 h-5" />
              Flip
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
              aria-label="Share flashcard"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          <button
            onClick={nextCard}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
            aria-label="Next flashcard"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="bg-white/20 backdrop-blur-sm rounded-full h-2 mb-8">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
            }}
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={flashcards.length}
            aria-label={`Progress: ${currentIndex + 1} of ${
              flashcards.length
            } flashcards`}
          />
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
          >
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-purple-600" />
                <h2
                  id="share-modal-title"
                  className="text-2xl font-bold text-gray-800"
                >
                  Share Legal Knowledge
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="sender-email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Email
                  </label>
                  <input
                    id="sender-email"
                    type="email"
                    value={shareForm.sender}
                    onChange={handleShareFormChange("sender")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                    aria-describedby="sender-email-error"
                  />
                </div>

                <div>
                  <label
                    htmlFor="recipient-email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Recipient Email
                  </label>
                  <input
                    id="recipient-email"
                    type="email"
                    value={shareForm.recipient}
                    onChange={handleShareFormChange("recipient")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="friend@email.com"
                    required
                    aria-describedby="recipient-email-error"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={shareContent}
                  disabled={
                    loading || !shareForm.sender || !shareForm.recipient
                  }
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Share"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close language dropdown */}
        {showLanguageDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowLanguageDropdown(false)}
          />
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `,
        }}
      />
    </div>
  );
};

export default Flashcards;
