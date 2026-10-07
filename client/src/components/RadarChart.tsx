import React from 'react';

interface RadarChartProps {
  scores: {
    performance: number;
    comfort: number;
    economy: number;
    safety: number;
    value: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ scores }) => {
  // A simple placeholder for a radar chart. In a real app, you'd use a library like Recharts or Chart.js
  return (
    <div className="w-full aspect-square bg-gray-50 rounded-full flex items-center justify-center border-4 border-gray-100 relative">
      <div className="text-center">
        <span className="block text-xs font-bold text-gray-500 mb-1">CarMachi Scores</span>
        <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="text-right">Perf:</div><div className="font-semibold">{scores.performance}/10</div>
          <div className="text-right">Comf:</div><div className="font-semibold">{scores.comfort}/10</div>
          <div className="text-right">Econ:</div><div className="font-semibold">{scores.economy}/10</div>
          <div className="text-right">Safe:</div><div className="font-semibold">{scores.safety}/10</div>
          <div className="text-right">Value:</div><div className="font-semibold">{scores.value}/10</div>
        </div>
      </div>
      {/* Decorative radar rings */}
      <div className="absolute inset-4 rounded-full border border-gray-200 pointer-events-none"></div>
      <div className="absolute inset-10 rounded-full border border-gray-200 pointer-events-none"></div>
      <div className="absolute inset-16 rounded-full border border-gray-200 pointer-events-none"></div>
    </div>
  );
};

export default RadarChart;
