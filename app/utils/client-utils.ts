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

export function distanceBetween(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
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

export function lerpCoord(x1: number, y1: number, x2: number, y2: number, t: number): Coord {
    const r = new Float32Array(2) as Coord;
    r[0] = x1 + t * (x2 - x1);
    r[1] = y1 + t * (y2 - y1);
    return r;
}
