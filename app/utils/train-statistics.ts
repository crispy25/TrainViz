type StopCoords = { [key: string]: [number, number] };

interface TrainData {
  [trainId: string]: {
    name: string;
    activeDays: number;
    stopNames: string[];
    stopTimes: number[];
  };
}

interface YearStats {
  year: string;
  averageSpeed: number;
  totalDistanceKm: number;
  totalTrains: number;
  stationFrequency: { [stationName: string]: number };
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const RAILWAY_DISTANCE_CORRECTION = 1;

export function calculateYearlyStats(
  year: string,
  trainData: TrainData,
  stopCoords: StopCoords
): YearStats {
  let totalSpeedSum = 0;
  let trainCountForSpeed = 0;
  let totalDistanceAllTrains = 0;
  const stationFrequency: { [key: string]: number } = {};

  Object.values(trainData).forEach((train) => {
    if (!train.stopNames || train.stopNames.length < 2) return;

    let trainDistance = 0;
    let validPath = true;

    for (let i = 0; i < train.stopNames.length; i++) {
      const station = train.stopNames[i];
      stationFrequency[station] = (stationFrequency[station] || 0) + 1;

      if (i > 0) {
        const prevStation = train.stopNames[i - 1];
        const coords1 = stopCoords[prevStation];
        const coords2 = stopCoords[station];

        if (coords1 && coords2) {
          trainDistance += getDistanceFromLatLonInKm(coords1[0], coords1[1], coords2[0], coords2[1]) * RAILWAY_DISTANCE_CORRECTION;
        } else {
        }
      }
    }

    const durationSeconds = train.stopTimes[train.stopTimes.length - 2] - train.stopTimes[1];
    
    if (durationSeconds > 0 && trainDistance > 0) {
      const durationHours = durationSeconds / 3600;
      const avgSpeed = trainDistance / durationHours;
      
      if (avgSpeed > 5 && avgSpeed < 160) {
        totalSpeedSum += avgSpeed;
        trainCountForSpeed++;
      }
    }

    totalDistanceAllTrains += trainDistance;
  });

  return {
    year,
    averageSpeed: trainCountForSpeed > 0 ? parseFloat((totalSpeedSum / trainCountForSpeed).toFixed(2)) : 0,
    totalDistanceKm: parseFloat(totalDistanceAllTrains.toFixed(2)),
    totalTrains: Object.keys(trainData).length,
    stationFrequency
  };
}
