import { INFINITE_CACHE } from "next/dist/lib/constants";
import { Coord, Path, TrainMetadata } from "../utils/types";
import { timeElapsedPercentage, lerpCoord, distanceBetween } from "../utils/client-utils";
import { ALMOST_ONE, ALMOST_ZERO, INVALID_COORD, SECONDS_IN_A_DAY } from "../utils/constants";
import { RoutingManager } from "./RoutingManager";


export class Train {
  private id: string
  private name: string
  private activeDays: number

  private path: Path = new Float32Array();
  private stops: string[] = []
  private stopCoords: Coord[] = [];
  private stopTimestamps: Int32Array = new Int32Array()
  private normalizedStopTimestamps: Int32Array = new Int32Array()
  private distanceBetweenStops: Float32Array = new Float32Array()
  private nextStopIdx: number = 1

  private hasOverflowTimestamps: boolean = false
  private overflowTimestampsCount: number = 0
  private firstOverflowTimestampIdx: number = -1
  private lowestDepartureTimestamp: number
  private highestArrivalTimestamp: number

  private updateCallsCnt: number = 0
  private position: Coord = INVALID_COORD;

  private lastStopIdx: number = -1
  private lastTimestampIdx: number = -1
  private lastTime: number = INFINITE_CACHE

  private routingManager: RoutingManager;

  constructor(id: string, meta: TrainMetadata, routingManager: RoutingManager) {
    this.id = id;
    this.name = meta.name + " " + id;
    this.activeDays = meta.activeDays;

    this.stops = meta.stopNames;
    this.stopTimestamps = meta.stopTimes;
    this.normalizedStopTimestamps = this.stopTimestamps;
    this.lowestDepartureTimestamp = this.stopTimestamps[1];
    this.highestArrivalTimestamp = this.stopTimestamps[meta.stopTimes.length - 2];
    this.overflowTimestampsCount = meta.stopTimes.length;

    this.routingManager = routingManager;
    this.distanceBetweenStops = routingManager.getDistanceBetweenStops(this.stops);
    this.stopCoords = this.stops.map((stop) => routingManager.getStopCoords(stop));

    let index = -1;
    for (let i = 2 ; i < meta.stopTimes.length; i += 2)
      if (meta.stopTimes[i] >= SECONDS_IN_A_DAY) {
        this.hasOverflowTimestamps = true;
        index = i;
        break;
      }

    if (index >= 0) {
      const overflowTimestamps = meta.stopTimes.slice(index).map(time => time % SECONDS_IN_A_DAY);
      this.normalizedStopTimestamps = new Int32Array(meta.stopTimes);
      this.overflowTimestampsCount = overflowTimestamps.length;
      this.firstOverflowTimestampIdx = index;

      this.normalizedStopTimestamps.set(overflowTimestamps);
      this.normalizedStopTimestamps.set(meta.stopTimes.slice(0, index), overflowTimestamps.length);
    }
  }

  isActiveOnDay(dayOfWeek: number) {
    return this.activeDays & (1 << dayOfWeek);
  }

  getID() {
    return this.id;
  }

  getPosition() {
    return this.position;
  }

  getNextStopIdx() {
      return this.nextStopIdx;
  }

  getStop(index: number) {
    return this.stops[index];
  }

  getStopNames() {
    return this.stops;
  }

  getStopsCount() {
    return this.stops.length;
  }

  async updatePosition(time: number) {
    const version = ++this.updateCallsCnt;

    const nextPos = this.getNextPositionAt(time);

    if (version !== this.updateCallsCnt)
      return;

    this.position = nextPos;
  }

  private isActiveAtTime(time: number) {
    return (!this.hasOverflowTimestamps && (time > this.lowestDepartureTimestamp && time < this.highestArrivalTimestamp)) ||
            (this.hasOverflowTimestamps && (time < this.highestArrivalTimestamp - SECONDS_IN_A_DAY || time > this.lowestDepartureTimestamp));
  }

  private getNextPositionAt(time: number) {
    if (!this.isActiveAtTime(time))
      return INVALID_COORD;
 
    let index = 0;
    if (time >= this.lastTime) // Jump stations if time goes forward
        index = this.lastTimestampIdx;

    while (index < this.normalizedStopTimestamps.length) {
        if (this.normalizedStopTimestamps[index] >= time)
            break;

        index += 2;
    }

    if (index >= this.normalizedStopTimestamps.length)
      index = 0;

    this.lastTimestampIdx = index;
    this.lastTime = time;

    const timestampIndex = index + (this.hasOverflowTimestamps ? (index < this.overflowTimestampsCount ? this.firstOverflowTimestampIdx : -this.overflowTimestampsCount) : 0);
    const arrivalTimestamp = this.stopTimestamps[timestampIndex];
    const departureTimestamp = this.stopTimestamps[timestampIndex - 1];
    const stopIndex = Math.floor((timestampIndex - 1) / 2);

    if (stopIndex < 0 || stopIndex >= this.stops.length - 1)
        return INVALID_COORD;

    time += (this.hasOverflowTimestamps && index < this.overflowTimestampsCount && time < this.normalizedStopTimestamps[timestampIndex] ? SECONDS_IN_A_DAY : 0);

    if (time < departureTimestamp)
      return this.stopCoords[stopIndex];
    
    this.nextStopIdx = stopIndex + 1;
    const distanceBetweenStations = this.distanceBetweenStops[stopIndex + 1]
    const timeRatio = timeElapsedPercentage(departureTimestamp, arrivalTimestamp, time);

    if (timeRatio < ALMOST_ZERO)
      return this.stopCoords[stopIndex];

    if (timeRatio > ALMOST_ONE)
      return this.stopCoords[stopIndex + 1];

    const distance = distanceBetweenStations * timeRatio;
    let currentDist = 0;
    let lastDist = 0;
    let i = 0;

    if (stopIndex !== this.lastStopIdx) {
      this.path = this.routingManager.getLinkPath(this.stops[stopIndex], this.stops[stopIndex + 1]);
      this.lastStopIdx = stopIndex;
    }

    for (; i < this.path.length - 3 && currentDist <= distance; i += 2) {
        lastDist = distanceBetween(this.path[i], this.path[i + 1], this.path[i + 2], this.path[i + 3])
        currentDist += lastDist;
    }

    if (lastDist < ALMOST_ZERO)
      return INVALID_COORD;

    const remainingDistance = currentDist - distance;
    const segmentRatio = (lastDist - remainingDistance) / lastDist;

    i -= 2;
    return lerpCoord(this.path[i], this.path[i + 1], this.path[i + 2], this.path[i + 3], segmentRatio);
  }

  toString() {
    return this.name;
  }
}