'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatsCharts from './StatsCharts';
import DensityAnalysis from './DensityAnalysis';

interface StatisticsDashboardProps {
  stats: any[];
  heatmapData: any;
  years: string[];
}

export default function StatisticsDashboard({ stats, heatmapData, years }: StatisticsDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const filteredStats = selectedYear === 'all' 
    ? stats 
    : stats.filter(s => s.year === selectedYear);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Train Statistics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Comparative analysis of network performance and coverage</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
            >
              Back to Main Map
            </Link>
          </div>
        </header>

        <div className="mb-6 flex justify-end items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Charts:</span>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg pl-4 pr-10 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm cursor-pointer"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <StatsCharts data={filteredStats} />

        {Object.keys(heatmapData).length > 0 ? (
          <DensityAnalysis dataByYear={heatmapData} />
        ) : (
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
            No density data available.
          </div>
        )}
      </div>
    </div>
  );
}