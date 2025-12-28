import { INFINITE_CACHE } from "next/dist/lib/constants";
import { Coord, Path, TrainMetaDataType } from "../utils/types";
import { timeElapsedPercentage, lerpCoord, distanceBetween } from "../utils/client-utils";
import { ALMOST_ONE, ALMOST_ZERO, INVALID_COORD } from "../utils/constants";
import { RoutingManager } from "./RoutingManager";


export class Train {
  private id: string
  private name: string
  private activeDays: number
  private stops: string[] = []
  private stopTimestamps: Int32Array = new Int32Array()
  private nextStopIdx: number = 1
  private path: Path = new Float32Array();
  private stopCoords: Coord[] = [];
  private updateCallsCnt: number = 0
  private distanceBetweenStops: Float32Array = new Float32Array()
  private position: Coord = INVALID_COORD;

  private lastStopIndex: number = -1
  private lastTimestampIndex: number = -1
  private lastTime: number = INFINITE_CACHE

  private routingManager: RoutingManager;

  constructor(id: string, meta: TrainMetaDataType, routingManager: RoutingManager) {
    this.id = id;
    this.name = meta.name + " " + id.toString();
    this.activeDays = meta.activeDays;
    this.stopTimestamps = meta.stopTimes;
    this.stops = meta.stopNames;

    this.routingManager = routingManager;
    this.distanceBetweenStops = routingManager.getDistanceBetweenStops(this.stops);
    this.stopCoords = this.stops.map((stop) => routingManager.getStopCoords(stop));
  }

  isActiveOnDay(dayOfWeek: number) {
    return this.activeDays & (1 << dayOfWeek);
  }

  clearCache() {
    this.lastTime = INFINITE_CACHE
    this.lastTimestampIndex = -1
    this.lastStopIndex = -1
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

  private getNextPositionAt(time: number) {
    if (time <= this.stopTimestamps[1] || time >= this.stopTimestamps[this.stopTimestamps.length - 2]) return INVALID_COORD;

    let index = 0;
    if (time >= this.lastTime) // Jump stations if time goes forward
        index = this.lastTimestampIndex;

    while (index < this.stopTimestamps.length) {
        if (this.stopTimestamps[index] >= time)
            break;

        index += 2;
    }
    this.lastTimestampIndex = index;
    this.lastTime = time;

    const arrival_timestamp = this.stopTimestamps[index];
    const departure_timestamp = this.stopTimestamps[index - 1];
    const stopIndex = Math.floor((index - 1) / 2);

    if (stopIndex >= this.stops.length - 1)
        return INVALID_COORD;

    if (time <= departure_timestamp)
      return this.stopCoords[stopIndex];

    this.nextStopIdx = stopIndex + 1;
    const distanceBetweenStations = this.distanceBetweenStops[stopIndex + 1]
    const timeRatio = timeElapsedPercentage(departure_timestamp, arrival_timestamp, time);
    const distance = distanceBetweenStations * timeRatio;

    if (distance < ALMOST_ZERO)
      return this.stopCoords[stopIndex];

    if (timeRatio > ALMOST_ONE)
      return this.stopCoords[stopIndex + 1];

    let current_dist = 0;
    let last_dist = 0;
    let i = 0;

    if (stopIndex !== this.lastStopIndex) {
      this.path = this.routingManager.getLinkPath(this.stops[stopIndex], this.stops[stopIndex + 1]);
      this.lastStopIndex = stopIndex;
    }

    for (; i < this.path.length - 3 && current_dist <= distance; i += 2) {
        last_dist = distanceBetween(this.path[i], this.path[i + 1], this.path[i + 2], this.path[i + 3])
        current_dist += last_dist;
    }

    if (last_dist < ALMOST_ZERO)
      return INVALID_COORD;

    const remaining_distance = current_dist - distance;
    const segment_ratio = (last_dist - remaining_distance) / last_dist;

    i -= 2;
    return lerpCoord(this.path[i], this.path[i + 1], this.path[i + 2], this.path[i + 3], segment_ratio);
  }

  toString() {
    return this.name;
  }
}