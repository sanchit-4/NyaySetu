import React, { useEffect, useState } from "react";
import { ChartBarIcon, BookOpenIcon, CheckCircleIcon, QuizIcon } from "./icons";
import {
  User,
  LearningModule as LearningModuleType,
  QuizScoreData,
} from "../types";
import { getProgressForUser } from "../utils/progressService";
import { learningModules } from "../data/learnData"; // Assuming this is the path
import { Link } from "react-router-dom";
import { PATHS } from "../constants";
import { useLanguage } from "../context/LanguageContext";
import FloatingParticles from "./FloatingParticles";
import LeaderboardCard from "./LeaderboardCard";
import "../styles/animations.css";

interface ProgressPageProps {
  user: User;
}

interface ModuleProgress extends LearningModuleType {
  lessonsReadCount: number;
  quizScoreData?: QuizScoreData;
  isCompleted: boolean;
}

const ProgressPage: React.FC<ProgressPageProps> = ({ user }) => {
  const [progressModules, setProgressModules] = useState<ModuleProgress[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalLessonsRead, setTotalLessonsRead] = useState(0);
  const { translate, currentLanguage } = useLanguage();
  const [pageLabels, setPageLabels] = useState({
    title: "Your Learning Progress",
    subtitle: "Track your achievements and see how far you've come!",
    overallProgress: "Overall Progress",
    lessonsCompleted: "Lessons Completed",
    startLearning: "Start Learning",
    viewModule: "View Module",
    quizTaken: "Quiz Taken",
    noQuizTaken: "Quiz not taken yet",
    completed: "Completed!",
  });

  useEffect(() => {
    const doTranslate = async () => {
      setPageLabels({
        title: await translate("Your Learning Progress"),
        subtitle: await translate(
          "Track your achievements and see how far you've come!"
        ),
        overallProgress: await translate("Overall Progress"),
        lessonsCompleted: await translate("Lessons Completed"),
        startLearning: await translate("Start Learning"),
        viewModule: await translate("View Module"),
        quizTaken: await translate("Quiz Taken"),
        noQuizTaken: await translate("Quiz not taken yet"),
        completed: await translate("Completed!"),
      });
    };
    doTranslate();
  }, [translate, currentLanguage]);

  useEffect(() => {
    if (user && learningModules) {
      const userProgress = getProgressForUser(user.id);
      let calculatedTotalLessons = 0;
      let calculatedTotalLessonsRead = 0;

      const enrichedModules = learningModules.map((module) => {
        calculatedTotalLessons += module.lessons.length;
        const lessonsReadCount = module.lessons.filter((lesson) =>
          userProgress.readLessons.includes(`${module.id}_${lesson.id}`)
        ).length;
        calculatedTotalLessonsRead += lessonsReadCount;

        const isCompleted =
          lessonsReadCount === module.lessons.length &&
          !!userProgress.quizScores[module.id];

        return {
          ...module,
          lessonsReadCount,
          quizScoreData: userProgress.quizScores[module.id],
          isCompleted,
        };
      });

      setTotalLessons(calculatedTotalLessons);
      setTotalLessonsRead(calculatedTotalLessonsRead);
      setProgressModules(enrichedModules);
    }
  }, [user, currentLanguage]); // Re-calculate if user changes or language (for translated module titles if they were dynamic)

  const overallProgressPercentage =
    totalLessons > 0 ? Math.round((totalLessonsRead / totalLessons) * 100) : 0;

  return (
    <div className="animate-fadeIn p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <header className="mb-8 pb-6 border-b border-gray-300">
            <div className="flex items-center text-3xl sm:text-4xl font-bold text-primary-dark">
              <ChartBarIcon className="w-10 h-10 sm:w-12 sm:h-12 mr-3 text-secondary" />
              <span>{pageLabels.title}</span>
            </div>
            <p className="mt-2 text-md sm:text-lg text-mediumtext">
              {pageLabels.subtitle}
            </p>
          </header>

          {/* Overall Progress Summary */}
          <div className="mb-10 p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border-t-4 border-primary">
            <h2 className="text-2xl font-semibold text-darktext mb-4">
              {pageLabels.overallProgress}
            </h2>
            <div className="flex items-center mb-2">
              <BookOpenIcon className="w-6 h-6 text-indigo-500 mr-2" />
              <span className="text-lg text-mediumtext">
                {totalLessonsRead} / {totalLessons}{" "}
                {pageLabels.lessonsCompleted}
              </span>
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-8 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all duration-700 ease-out"
                style={{ width: `${overallProgressPercentage}%` }}
                role="progressbar"
                aria-valuenow={overallProgressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {overallProgressPercentage > 10
                  ? `${overallProgressPercentage}%`
                  : ""}
              </div>
            </div>
          </div>

          {/* Per-Module Progress */}
          {progressModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {progressModules.map((module, index) => (
                <div
                  key={module.id}
                  className={`p-5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 border-l-4 float-animation`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-darktext group-hover:text-primary transition-colors">
                      {currentLanguage !== "en"
                        ? translate(module.title)
                        : module.title}
                    </h3>
                    {module.isCompleted && (
                      <CheckCircleIcon
                        className="w-7 h-7 text-green-500 flex-shrink-0"
                        title={pageLabels.completed}
                      />
                    )}
                  </div>
                  <p className="text-xs text-mediumtext mb-3 line-clamp-2">
                    {currentLanguage !== "en"
                      ? translate(module.description)
                      : module.description}
                  </p>

                  {/* Lesson Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-mediumtext mb-1">
                      <span>Lessons</span>
                      <span>
                        {module.lessonsReadCount} / {module.lessons.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            module.lessons.length > 0
                              ? (module.lessonsReadCount /
                                  module.lessons.length) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Quiz Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-mediumtext mb-1">
                      <span>Quiz Score</span>
                      {module.quizScoreData ? (
                        <span className="font-semibold text-blue-700">
                          {module.quizScoreData.percentage}%
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">
                          {pageLabels.noQuizTaken}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      {module.quizScoreData && (
                        <div
                          className={`${
                            module.quizScoreData.percentage >= 70
                              ? "bg-green-500"
                              : module.quizScoreData.percentage >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          } h-2.5 rounded-full`}
                          style={{
                            width: `${module.quizScoreData.percentage}%`,
                          }}
                        ></div>
                      )}
                    </div>
                  </div>

                  <Link
                    to={PATHS.LEARN_MODULE_LESSONS.replace(
                      ":moduleId",
                      module.id
                    )}
                  >
                    <button
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                        module.isCompleted
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-primary hover:bg-primary-dark text-white"
                      }`}
                    >
                      {module.lessonsReadCount > 0 || module.quizScoreData ? (
                        module.isCompleted ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          <BookOpenIcon className="w-5 h-5" />
                        )
                      ) : (
                        <BookOpenIcon className="w-5 h-5" />
                      )}
                      <span>
                        {module.isCompleted
                          ? pageLabels.completed
                          : module.lessonsReadCount > 0 || module.quizScoreData
                          ? pageLabels.viewModule
                          : pageLabels.startLearning}
                      </span>
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 border-2 border-dashed border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm float-animation">
              <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-darktext">
                No learning modules available to track progress.
              </p>
              <p className="text-mediumtext mt-2">
                Explore the "Learn" section to get started!
              </p>
              <Link to={PATHS.DASHBOARD_ROOT} className="mt-4 inline-block">
                <button className="py-2 px-5 bg-secondary text-white rounded-lg hover:bg-emerald-600 transition">
                  Go to Learning Hub
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="lg:w-80 flex-shrink-0">
          <LeaderboardCard currentUserName={user.name} />
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
