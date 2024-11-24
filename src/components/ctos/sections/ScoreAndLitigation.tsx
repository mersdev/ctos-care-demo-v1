import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { CTOSScore, CTOSLitigationIndex } from "../../../types/ctos";

interface ScoreDisplayProps {
  score?: CTOSScore | null;
}

interface LitigationDisplayProps {
  index?: CTOSLitigationIndex | null;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  if (!score) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Score not available</p>
      </div>
    );
  }

  const getScoreColor = (value: number) => {
    if (value >= 750) return "text-green-600";
    if (value >= 600) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="text-center p-4">
      <div className={`text-6xl font-bold ${getScoreColor(score.score)} mb-2`}>
        {score.score}
      </div>
      <p className="text-base font-medium text-gray-600">CTOS Score</p>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {Object.entries(score.factors).map(([factor, value]) => (
          <div key={factor}>
            <div className="text-sm font-medium text-gray-500">
              {factor.replace(/([A-Z])/g, " $1").trim()}
            </div>
            <div className="text-lg font-semibold mt-1">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LitigationDisplay: React.FC<LitigationDisplayProps> = ({ index }) => {
  if (!index) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Litigation index not available</p>
      </div>
    );
  }

  const getIndexColor = (value: number) => {
    if (value <= 0.3) return "text-green-600";
    if (value <= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="text-center p-4">
      <div className={`text-5xl font-bold ${getIndexColor(index.index)} mb-2`}>
        {(index.index * 100).toFixed(0)}%
      </div>
      <p className="text-base font-medium text-gray-600">Litigation Risk</p>
      <div className="mt-6">
        <p className="text-sm text-gray-500">{index.explanation}</p>
      </div>
    </div>
  );
};

interface ScoreAndLitigationSectionProps {
  score?: CTOSScore | null;
  litigationIndex?: CTOSLitigationIndex | null;
}

export const ScoreAndLitigationSection: React.FC<
  ScoreAndLitigationSectionProps
> = ({ score, litigationIndex }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <ChartBarIcon className="h-6 w-6 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-800">
          Credit Assessment
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <ScoreDisplay score={score} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <LitigationDisplay index={litigationIndex} />
        </div>
      </div>
    </div>
  );
};
