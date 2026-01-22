'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const StationHeatmap = dynamic(() => import('./StationHeatmap'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
});

interface DensityAnalysisProps {
  dataByYear: {
    [year: string]: {
      frequency: any;
      coords: any;
      routeSegments: { [key: string]: number };
    };
  };
}

export default function DensityAnalysis({ dataByYear }: DensityAnalysisProps) {
  const years = Object.keys(dataByYear).sort();
  const [selectedYear, setSelectedYear] = useState(years[years.length - 1]);

  const currentData = dataByYear[selectedYear];

  if (!currentData) return null;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            Station Traffic Density ({selectedYear})
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700 rounded">Low</span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700 rounded">Medium</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-700 rounded">High</span>
          <span className="px-2 py-1 bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-700 rounded">Intense</span>
        </div>
      </div>

      <div key={selectedYear} className="w-full min-h-[500px]">
        <StationHeatmap
          stationFrequency={currentData.frequency}
          stopCoords={currentData.coords}
          routeSegments={currentData.routeSegments}
        />
      </div>
    </div>
  );
}
