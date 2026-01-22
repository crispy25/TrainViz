'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface StatsChartsProps {
  data: Array<{
    year: string;
    averageSpeed: number;
    totalTrains: number;
    interoperableStations?: number;
    totalDistanceKm?: number;
    [key: string]: any;
  }>;
}

export default function StatsCharts({ data }: StatsChartsProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkClass = document.documentElement.classList.contains('dark');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setIsDark(isDarkClass || prefersDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => checkTheme();
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const colors = {
    text: isDark ? '#a3a3a3' : '#525252', 
    grid: isDark ? '#404040' : '#e5e5e5',
    tooltipBg: isDark ? '#171717' : '#ffffff',
    tooltipBorder: isDark ? '#404040' : '#e5e5e5',
    bar1: isDark ? '#f5f5f5' : '#171717',
    bar2: isDark ? '#737373' : '#a3a3a3',
    bar3: isDark ? '#d4d4d4' : '#525252',
    bar4: isDark ? '#a3a3a3' : '#6b7280',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-6">
          Network Volume
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="year" stroke={colors.text} />
              <YAxis yAxisId="left" orientation="left" stroke={colors.text} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: colors.tooltipBg,
                  borderColor: colors.tooltipBorder,
                  color: colors.text,
                }}
                itemStyle={{ color: colors.text }}
              />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Bar yAxisId="left" dataKey="totalTrains" name="Total Trains" fill={colors.bar2} />
              <Bar yAxisId="left" dataKey="interoperableStations" name="Active Stations" fill={colors.bar3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-6">
          Operational Performance
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="year" stroke={colors.text} />
              <YAxis yAxisId="speed" orientation="left" stroke={colors.text} />
              <YAxis yAxisId="dist" orientation="right" stroke={colors.text} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: colors.tooltipBg,
                  borderColor: colors.tooltipBorder,
                  color: colors.text,
                }}
                itemStyle={{ color: colors.text }}
              />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Bar yAxisId="speed" dataKey="averageSpeed" name="Avg Speed (km/h)" fill={colors.bar1} />
              <Bar yAxisId="dist" dataKey="totalDistanceKm" name="Total Distance (km)" fill={colors.bar4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}