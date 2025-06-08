import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { User } from "../types";
import { PATHS } from "../constants";
import TopNavbar from "./TopNavbar";
import LearnContent from "./LearnContent";
import ModuleView from "./learn/ModuleView";
import ChatbotInterface from "./ChatbotInterface";
import DocumentManagement from "./DocumentManagement";
import ProgressPage from "./ProgressPage";
import AboutUsPage from "./AboutUsPage";
import ContactPage from "./ContactPage";
import Flashcards from "./Flashcards";

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const learnModuleBase = PATHS.LEARN_MODULE.replace(
    PATHS.DASHBOARD_ROOT,
    ""
  ).substring(1);
  const chatbotBase = PATHS.CHATBOT.replace(PATHS.DASHBOARD_ROOT, "").substring(
    1
  );
  const documentsBase = PATHS.DOCUMENTS.replace(
    PATHS.DASHBOARD_ROOT,
    ""
  ).substring(1);
  const progressBase = PATHS.PROGRESS.replace(
    PATHS.DASHBOARD_ROOT,
    ""
  ).substring(1);
  const aboutUsBase = PATHS.ABOUT_US.replace(
    PATHS.DASHBOARD_ROOT,
    ""
  ).substring(1);
  const contactBase = PATHS.CONTACT.replace(PATHS.DASHBOARD_ROOT, "").substring(
    1
  );
  const flashcardsBase = PATHS.FLASHCARDS.replace(
    PATHS.DASHBOARD_ROOT,
    ""
  ).substring(1);

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavbar user={user} onLogout={onLogout} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-sky-100 via-indigo-100 to-purple-200 overflow-y-auto">
        <Routes>
          <Route path="/" element={<LearnContent user={user} />} />{" "}
          {/* Pass user to LearnContent if needed for module card interactions */}
          <Route
            path={`${learnModuleBase}/*`}
            element={<ModuleView user={user} />}
          />{" "}
          {/* Pass user */}
          <Route path={chatbotBase} element={<ChatbotInterface />} />{" "}
          {/* Chatbot might not need user directly if API keys are server-side */}
          <Route path={documentsBase} element={<DocumentManagement />} />{" "}
          {/* DocumentManagement might need user for saving context (future) */}
          <Route
            path={progressBase}
            element={<ProgressPage user={user} />}
          />{" "}
          {/* Pass user */}
          <Route path={aboutUsBase} element={<AboutUsPage />} />
          <Route path={contactBase} element={<ContactPage />} />
          <Route path={flashcardsBase} element={<Flashcards />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default DashboardPage;
