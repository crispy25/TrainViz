import { INFINITE_CACHE } from "next/dist/lib/constants";
import { Coord } from "../utils/types";
import { dist, timeElapsedPercentage, lerpCoord } from "../utils/utils";
import { INVALID_COORD, TRAIN_ALL_WEEK_SERVICE, TRAIN_DEFAULT_NAME } from "../utils/constants";


export class Train {
  private id: number
  private name: string = TRAIN_DEFAULT_NAME
  private service_day_mask: number = TRAIN_ALL_WEEK_SERVICE
  private path: Coord[] = []
  private stop_idxs: Int32Array = new Int32Array()
  private stop_timestamps: Int32Array = new Int32Array()
  private next_stop_idx: number = 1
  private position: Coord = INVALID_COORD;
  private _updateCallsCnt: number = 0

  private last_index: number = 0
  private last_time: number = INFINITE_CACHE
  private distance_cache: Float32Array = new Float32Array()

  constructor(id: number, shortname: string, service_day_mask: number, path: Coord[], stop_idxs: Int32Array, stops_timestamps: Int32Array) {
    this.id = id;
    this.name = shortname + " " + id.toString();
    this.service_day_mask = service_day_mask;
    this.path = path;
    this.stop_timestamps = stops_timestamps;
    this.stop_idxs = stop_idxs;
    this.distance_cache = new Float32Array(stop_idxs.length)

    for (let index = 0; index < stop_idxs.length - 1; index++) {
      const current_stop_idx = this.stop_idxs[index];
      const next_stop_idx = this.stop_idxs[index + 1];
      
      let total_dist = 0;
      for (let i = current_stop_idx; i < next_stop_idx; i++)
          total_dist += dist(this.path[i], this.path[i + 1])

      this.distance_cache[index + 1] = total_dist;
    }
  }

  hasRoute(): boolean {
    return this.path.length > 0;
  }

  clearCache() {
    this.last_index = 0
    this.last_time = INFINITE_CACHE
    this.distance_cache = new Float32Array(this.stop_idxs.length)
  }

  getID() {
    return this.id;
  }

  toString() {
    return this.name;
  }

  getPosition() {
    return this.position;
  }

  getPathElement(index: number) {
    return this.path[index];
  }

  getPathLength() {
    return this.path.length;
  }

  getNextStopIdx() {
      return this.next_stop_idx;
  }

  async updatePosition(time: number) {
    const version = ++this._updateCallsCnt;

    const nextPos = this.getNextPositionAt(time);

    if (version !== this._updateCallsCnt)
      return;

    this.position = nextPos;
  }

  private getNextPositionAt(time: number) {
    if (this.path.length <= 1 || time <= this.stop_timestamps[1] ||
        time >= this.stop_timestamps[this.stop_timestamps.length - 2]) return INVALID_COORD;

    let index = 0;
    if (time >= this.last_time) // Jump stations if time goes forward
        index = this.last_index;

    while (index < this.stop_timestamps.length) {
        if (this.stop_timestamps[index] >= time)
            break;

        index += 2;
    }
    this.last_index = index;
    this.last_time = time;

    const arrival_timestamp = this.stop_timestamps[index];
    const departure_timestamp = this.stop_timestamps[index - 1];
    index = Math.floor((index - 1) / 2);

    if (index >= this.stop_idxs.length - 1)
        return INVALID_COORD;

    if (time >= arrival_timestamp && time <= departure_timestamp)
        return this.path[this.stop_idxs[index]];

    const current_stop_idx = this.stop_idxs[index];
    const next_stop_idx = this.stop_idxs[index + 1];
    this.next_stop_idx = next_stop_idx;

    let total_dist = this.distance_cache[index + 1];
    const distance = total_dist * timeElapsedPercentage(departure_timestamp, arrival_timestamp, time);

    if (distance < 0.001)
      return this.path[current_stop_idx];

    let current_dist = 0;
    let last_dist = 0;
    let i = current_stop_idx;
    for (; i < next_stop_idx && current_dist <= distance; i++) {
        last_dist = dist(this.path[i], this.path[i + 1])
        current_dist += last_dist;
    }

    const remaining_distance = current_dist - distance;
    const segment_ratio = (last_dist - remaining_distance) / last_dist;

    return lerpCoord(this.path[i - 1], this.path[i], segment_ratio);
  }
}