import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { User } from "../types";
import { APP_NAME, PATHS } from "../constants";
import {
  LogoIcon,
  ChatIcon,
  DocumentIcon,
  UserIcon,
  LogoutIcon,
  ChevronDownIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PhoneIcon,
  GlobeAltIcon,
  XCircleIcon, // Added XCircleIcon here
  BookOpenIcon, // Import BookOpenIcon
} from "./icons";
import { useLanguage } from "../context/LanguageContext"; // Import useLanguage

interface TopNavbarProps {
  user: User;
  onLogout: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ user, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const {
    currentLanguage,
    setCurrentLanguage,
    availableLanguages,
    isLoadingLanguages,
    translate,
  } = useLanguage();

  // State for translated labels
  const [labels, setLabels] = useState({
    chatbot: "AI Chatbot",
    progress: "Progress",
    documents: "Documents",
    about: "Storybook", // Changed from "About Us"
    contact: "About Us", // Changed from "Contact"
    signedInAs: "Signed in as",
    logout: "Logout",
    flashcards: "Flashcards", // Added flashcards label
  });

  useEffect(() => {
    const translateLabels = async () => {
      setLabels({
        chatbot: await translate("AI Chatbot"),
        progress: await translate("Progress"),
        documents: await translate("Documents"),
        about: await translate("Storybook"), // Changed from "About Us"
        contact: await translate("About Us"), // Changed from "Contact"
        signedInAs: await translate("Signed in as"),
        logout: await translate("Logout"),
        flashcards: await translate("Flashcards"), // Translate flashcards label
      });
    };
    translateLabels();
  }, [translate, currentLanguage]);

  const navItems = [
    { id: "chatbot", labelKey: "chatbot", icon: ChatIcon, path: PATHS.CHATBOT },
    {
      id: "progress",
      labelKey: "progress",
      icon: ChartBarIcon,
      path: PATHS.PROGRESS,
    },
    {
      id: "documents",
      labelKey: "documents",
      icon: DocumentIcon,
      path: PATHS.DOCUMENTS,
    },
    {
      id: "about",
      labelKey: "about",
      icon: InformationCircleIcon,
      path: PATHS.ABOUT_US,
    },
    {
      id: "contact",
      labelKey: "contact",
      icon: PhoneIcon,
      path: PATHS.CONTACT,
    },
    {
      id: "flashcards", // New flashcards nav item
      labelKey: "flashcards",
      icon: BookOpenIcon,
      path: PATHS.FLASHCARDS,
    },
  ];

  const baseLinkClasses =
    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
  const inactiveLinkClasses =
    "text-gray-300 hover:bg-primary-dark hover:text-white";
  const activeLinkClasses = "bg-primary text-white shadow-md";

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to={PATHS.DASHBOARD_ROOT}
              className="flex-shrink-0 flex items-center space-x-2"
            >
              <LogoIcon className="h-10 w-auto text-primary-light" />
              <span className="text-xl font-bold text-white">{APP_NAME}</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {" "}
            {/* Reduced space for more items */}
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `${baseLinkClasses} ${
                    isActive ? activeLinkClasses : inactiveLinkClasses
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>
                  {labels[item.labelKey as keyof typeof labels] ||
                    item.labelKey}
                </span>
              </NavLink>
            ))}
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <div className="relative">
              <button
                className="flex items-center text-sm text-gray-300 hover:text-white p-1.5 rounded-md hover:bg-slate-700"
                title="Change language"
                onClick={(e) =>
                  (
                    e.currentTarget.nextElementSibling as HTMLSelectElement
                  )?.focus()
                } // Hack to open select on button click visually
              >
                <GlobeAltIcon className="w-5 h-5 mr-1" />
                <span className="hidden lg:inline">
                  {availableLanguages.find((l) => l.code === currentLanguage)
                    ?.name || currentLanguage.toUpperCase()}
                </span>
                <ChevronDownIcon className="w-4 h-4 ml-1 hidden lg:inline" />
              </button>
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                disabled={isLoadingLanguages}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" // Hidden select controlled by button
                aria-label="Select language"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="max-w-xs bg-slate-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white p-1 hover:bg-slate-700"
                id="user-menu-button"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <span className="sr-only">Open user menu</span>
                <UserIcon className="h-8 w-8 rounded-full text-primary-light bg-slate-700 p-1" />
                <span className="ml-2 text-sm font-medium text-gray-300 hidden lg:block">
                  {user.name || user.email}
                </span>
                <ChevronDownIcon
                  className={`ml-1 h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  } hidden lg:block`}
                />
              </button>
              {isUserMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm text-darktext">{labels.signedInAs}</p>
                    <p
                      className="text-sm font-medium text-darktext truncate"
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900"
                    role="menuitem"
                  >
                    <LogoutIcon className="w-5 h-5" />
                    <span>{labels.logout}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Mobile menu button (can be enhanced with language switcher too) */}
          <div className="-mr-2 flex md:hidden">
            {/* Simple select for mobile for now */}
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              disabled={isLoadingLanguages}
              className="bg-slate-700 text-white text-xs p-1 rounded-md focus:ring-primary mr-2"
              aria-label="Select language"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.code.toUpperCase()}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} // Could also toggle a full mobile menu
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isUserMenuOpen ? (
                <XCircleIcon className="block h-6 w-6" />
              ) : (
                <UserIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile User Menu (if open) - could be expanded to a full menu */}
      {isUserMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setIsUserMenuOpen(false)}
                className={({ isActive }) =>
                  `block ${baseLinkClasses} ${
                    isActive ? activeLinkClasses : inactiveLinkClasses
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>
                  {labels[item.labelKey as keyof typeof labels] ||
                    item.labelKey}
                </span>
              </NavLink>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-700">
            <div className="flex items-center px-5">
              <UserIcon className="h-10 w-10 rounded-full text-primary-light bg-slate-700 p-1.5" />
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">
                  {user.name || user.email.split("@")[0]}
                </div>
                <div className="text-sm font-medium leading-none text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={() => {
                  onLogout();
                  setIsUserMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700"
              >
                <LogoutIcon className="w-5 h-5 inline mr-2" />
                {labels.logout}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavbar;
