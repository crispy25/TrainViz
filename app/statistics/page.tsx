import fs from 'fs/promises';
import path from 'path';
import { calculateYearlyStats } from '../utils/train-statistics';
import StatisticsDashboard from '../components/StatisticsDashboard';

async function getDataForYear(year: string) {
  const dataDir = path.join(process.cwd(), 'data', 'years', year);
  
  try {
    const [coordsRaw, trainsRaw] = await Promise.all([
      fs.readFile(path.join(dataDir, 'stop_coords.json'), 'utf8'),
      fs.readFile(path.join(dataDir, 'train_data.json'), 'utf8')
    ]);
    
    return {
      coords: JSON.parse(coordsRaw),
      trains: JSON.parse(trainsRaw)
    };
  } catch (e) {
    console.error(`Error loading data for ${year}`, e);
    return null;
  }
}

export default async function StatisticsPage() {
  const years = ['2024', '2025'];
  const stats = [];
  
  const heatmapData: Record<string, {
    frequency: any;
    coords: any;
    routeSegments: { [key: string]: number };
  }> = {};
  

  for (const year of years) {
    const data = await getDataForYear(year);
    if (data) {
      const baseStats = calculateYearlyStats(year, data.trains, data.coords);
      
      const yearStatWithStations = {
        ...baseStats,
        interoperableStations: Object.keys(baseStats.stationFrequency).length,
      };
      stats.push(yearStatWithStations);

      const routeSegments: { [key: string]: number } = {};
      Object.values(data.trains).forEach((train: any) => {
        if (train.stopNames && train.stopNames.length > 1) {
          for (let i = 0; i < train.stopNames.length - 1; i++) {
            const s1 = train.stopNames[i];
            const s2 = train.stopNames[i+1];
            const key = s1 < s2 ? `${s1}$$${s2}` : `${s2}$$${s1}`;
            routeSegments[key] = (routeSegments[key] || 0) + 1;
          }
        }
      });
        heatmapData[year] = {
        frequency: baseStats.stationFrequency,
        coords: data.coords,
        routeSegments: routeSegments
      };
    }
  }

  return (
    <StatisticsDashboard 
      stats={stats} 
      heatmapData={heatmapData} 
      years={years} 
    />
  );
}
