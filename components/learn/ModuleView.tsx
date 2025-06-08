import React, { useEffect, useState } from "react";
import {
  useParams,
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import { getModuleById } from "../../data/learnData";
import { PATHS } from "../../constants";
import LessonDisplay from "./LessonDisplay";
import QuizView from "./QuizView";
import { BookOpenIcon, QuizIcon, ArrowLeftIcon, SpinnerIcon } from "../icons";
import { User } from "../../types";
import Button from "../common/Button";
import { useLanguage } from "../../context/LanguageContext";

interface ModuleViewProps {
  user: User;
}

const ModuleView: React.FC<ModuleViewProps> = ({ user }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const location = useLocation();
  const moduleData = moduleId ? getModuleById(moduleId) : undefined;
  const { translate, currentLanguage } = useLanguage();

  const [translatedModuleTitle, setTranslatedModuleTitle] = useState(
    moduleData?.title || ""
  );
  const [translatedLongDescription, setTranslatedLongDescription] = useState(
    moduleData?.longDescription || ""
  );
  const [tabLabels, setTabLabels] = useState({
    lessons: "Lessons",
    quiz: "Quiz",
  });
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(true);

  useEffect(() => {
    if (moduleData) {
      setIsLoadingTranslations(true);
      const doTranslate = async () => {
        try {
          const titlePromise = translate(moduleData.title);
          const longDescPromise = moduleData.longDescription
            ? translate(moduleData.longDescription)
            : Promise.resolve("");
          const lessonsLabelPromise = translate("Lessons");
          const quizLabelPromise = translate("Quiz");

          const [newTitle, newLongDesc, lessonsLabel, quizLabel] =
            await Promise.all([
              titlePromise,
              longDescPromise,
              lessonsLabelPromise,
              quizLabelPromise,
            ]);

          setTranslatedModuleTitle(newTitle);
          setTranslatedLongDescription(newLongDesc);
          setTabLabels({ lessons: lessonsLabel, quiz: quizLabel });
        } catch (error) {
          console.error("Error translating module view content:", error);
          setTranslatedModuleTitle(moduleData.title);
          setTranslatedLongDescription(moduleData.longDescription || "");
          setTabLabels({ lessons: "Lessons", quiz: "Quiz" });
        } finally {
          setIsLoadingTranslations(false);
        }
      };
      doTranslate();
    } else {
      setIsLoadingTranslations(false);
    }
  }, [moduleData, translate, currentLanguage]);

  if (!moduleData) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-xl animate-fadeIn">
        <h2 className="text-3xl font-semibold text-red-600 mb-4">
          Module Not Found
        </h2>
        <p className="text-mediumtext mt-2 mb-6">
          The learning module you are looking for does not exist or could not be
          loaded.
        </p>
        <NavLink to={PATHS.DASHBOARD_ROOT}>
          <Button
            variant="primary"
            leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
          >
            Back to Learning Hub
          </Button>
        </NavLink>
      </div>
    );
  }

  const lessonsRelativePath = "lessons";
  const quizRelativePath = "quiz";

  const navItems = [
    { nameKey: "lessons", path: lessonsRelativePath, icon: BookOpenIcon },
    { nameKey: "quiz", path: quizRelativePath, icon: QuizIcon },
  ];

  // Construct absolute paths for NavLinks
  const moduleBaseAbsolutePath = PATHS.LEARN_MODULE.replace(
    ":moduleId",
    moduleId || ""
  );

  const getNavLinkClass = (navItemPath: string) => {
    // For isActive check, we still need to compare against the end of the location.pathname
    // because moduleBaseAbsolutePath already includes /dashboard part.
    // location.pathname is like /dashboard/learn/module-id/lessons
    // We want to check if it ends with /module-id/lessons or /module-id/quiz
    const fullItemPathSuffix = `${moduleId}/${navItemPath}`;
    const isActive =
      location.pathname.endsWith(fullItemPathSuffix) ||
      (navItemPath === "lessons" &&
        location.pathname.endsWith(moduleId || "") &&
        !location.pathname.endsWith("/quiz")); // Handles default to lessons

    return `flex items-center space-x-3 px-4 py-3 font-medium rounded-lg transition-all duration-200 ease-in-out hover:bg-primary-light hover:text-white ${
      isActive
        ? "bg-primary text-white shadow-md"
        : "bg-white text-primary-dark hover:shadow-lg"
    }`;
  };

  return (
    <div className="animate-fadeIn">
      <header className="mb-6 p-6 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl shadow-xl">
        <Link
          to={PATHS.DASHBOARD_ROOT}
          className="text-sm hover:underline flex items-center mb-2 opacity-80 hover:opacity-100 transition-opacity"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1.5" /> Back to Hub
        </Link>
        {isLoadingTranslations ? (
          <div className="flex items-center">
            <SpinnerIcon className="w-8 h-8 animate-spin text-white/70 mr-3" />
            <span className="text-3xl sm:text-4xl font-bold">Loading...</span>
          </div>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold">
              {translatedModuleTitle}
            </h1>
            {moduleData.icon && (
              <moduleData.icon className="w-10 h-10 mt-2 opacity-70" />
            )}
            <p className="mt-2 text-sm opacity-90 line-clamp-2">
              {translatedLongDescription}
            </p>
          </>
        )}
      </header>

      <nav className="mb-8">
        <ul className="flex space-x-2 sm:space-x-4 border-b-2 border-gray-200 pb-3">
          {navItems.map((item) => (
            <li key={item.nameKey}>
              {/* Use explicitly constructed absolute path */}
              <NavLink
                to={`${moduleBaseAbsolutePath}/${item.path}`}
                className={getNavLinkClass(item.path)}
              >
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base">
                  {isLoadingTranslations
                    ? "..."
                    : tabLabels[item.nameKey as keyof typeof tabLabels]}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="bg-white/50 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg min-h-[400px]">
        {isLoadingTranslations ? (
          <div className="flex justify-center items-center h-[300px]">
            <SpinnerIcon className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <Routes>
            {/* Nested routes are still relative to ModuleView's path */}
            <Route
              path={lessonsRelativePath}
              element={
                <LessonDisplay
                  lessons={moduleData.lessons}
                  userId={user.id}
                  moduleId={moduleData.id}
                />
              }
            />
            <Route
              path={quizRelativePath}
              element={
                <QuizView
                  questions={moduleData.quiz}
                  moduleTitle={translatedModuleTitle}
                  moduleId={moduleData.id}
                  userId={user.id}
                />
              }
            />
            <Route
              path="/"
              element={<Navigate to={lessonsRelativePath} replace />}
            />
            <Route
              path="*"
              element={<Navigate to={lessonsRelativePath} replace />}
            />
          </Routes>
        )}
      </div>
    </div>
  );
};

export default ModuleView;
