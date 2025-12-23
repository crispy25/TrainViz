import { Coord } from "./types";


export function secondsToTimeStr(sec: number): string {
  const h = (sec / 3600) | 0;
  const m = ((sec / 60) | 0) % 60;
  const s = sec % 60;

  return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

export function isDaytime(sec: number): boolean {
  const hour = Math.floor(sec / 3600);
  return hour >= 6 && hour < 18;
}

export function dist(a: Coord, b: Coord): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
}

export function timeElapsedPercentage(departureTime: number, arrivalTime: number, currentTime: number): number {
    if (arrivalTime <= departureTime) return 1;
    const elapsed = currentTime - departureTime;
    const total = arrivalTime - departureTime;
    let percent = (elapsed / total);

    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;

    return percent;
}

export function lerpCoord(a: Coord, b: Coord, t: number): Coord {
    const r = new Float32Array(2) as Coord;
    r[0] = a[0] + t * (b[0] - a[0]);
    r[1] = a[1] + t * (b[1] - a[1]);
    return r;
}

function extractInt(text: string): number {
  const match = text.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

export function dictKeysToInt(data: { [id: string] : any }) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[extractInt(key)] = value;
    return acc;
  }, {} as { [id: number] : any });
}

export function dictKeyValuesToInt(data: { [id: number] : string }) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[extractInt(key)] = Number(value);
    return acc;
  }, {} as { [id: number] : number });
}
