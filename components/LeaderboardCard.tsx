import React from "react";
// If TrophyIcon is the default export and UserIcon is a named export:
// import TrophyIcon, { UserIcon } from './icons';

// Or, if both are named exports but TrophyIcon is missing, add TrophyIcon to './icons.tsx' like:
// export const TrophyIcon = () => (/* SVG or JSX here */);

// For now, to avoid the error, remove TrophyIcon from the import:
import { UserIcon } from "./icons";
import { FaTrophy } from "react-icons/fa"; // Ensure TrophyIcon is defined in icons.tsx

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isCurrentUser?: boolean;
}

const mockLeaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: "Priya Sharma", score: 950 },
  { rank: 2, name: "Amit Kumar", score: 885 },
  { rank: 3, name: "Raj Patel", score: 840 },
  { rank: 4, name: "Neha Singh", score: 780 },
  { rank: 5, name: "Dev Mehta", score: 755 },
];

const LeaderboardCard: React.FC<{ currentUserName?: string }> = ({
  currentUserName,
}) => {
  const data = mockLeaderboardData.map((entry) => ({
    ...entry,
    isCurrentUser: entry.name === currentUserName,
  }));

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 animate-fadeIn hover-lift">
      <div className="flex items-center mb-6">
        <FaTrophy className="w-6 h-6 text-yellow-500 mr-2" />
        <h3 className="text-xl font-semibold text-primary-dark">Leaderboard</h3>
      </div>

      <div className="space-y-3">
        {data.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center p-3 rounded-lg transition-all ${
              entry.isCurrentUser
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-gray-50"
            }`}
          >
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-full mr-3
              ${
                entry.rank === 1
                  ? "bg-yellow-100 text-yellow-700"
                  : entry.rank === 2
                  ? "bg-gray-100 text-gray-700"
                  : entry.rank === 3
                  ? "bg-orange-100 text-orange-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {entry.rank}
            </span>

            <div className="flex-1 flex items-center">
              <UserIcon className="w-5 h-5 text-primary-dark/70 mr-2" />
              <span className="font-medium text-sm text-darktext">
                {entry.name}
              </span>
            </div>

            <span className="font-semibold text-sm text-primary">
              {entry.score}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-center text-mediumtext">
        Based on quiz scores and lesson completion
      </div>
    </div>
  );
};

export default LeaderboardCard;
