import { INFINITE_CACHE } from "next/dist/lib/constants";
import { Coord, InvalidCoord } from "../utils/types";
import { dist, timeElapsedPercentage, lerpCoord } from "../utils/utils";


export class Train {
    id: number
    shortname: string
    service_day_mask: number
    path: Coord[] = []
    stop_ids: Int32Array = new Int32Array()
    stop_timestamps: Int32Array = new Int32Array()
    next_stop_id: number = 1

    last_index: number = 0
    last_time: number = INFINITE_CACHE
    distance_cache: Float32Array = new Float32Array()

    constructor(id: number, shortname: string, service_day_mask: number) {
        this.id = id;
        this.shortname = shortname;
        this.service_day_mask = service_day_mask;
    }

    setRoutePath(path: Coord[]) {
        this.path = path;
    }

    setStopTimes(stops_timestamps: Int32Array) {
        this.stop_timestamps = stops_timestamps;
    }

    setStopIds(stop_ids: Int32Array) {
        this.stop_ids = stop_ids;
        this.distance_cache = new Float32Array(stop_ids.length)
    }

    hasRoute(): boolean {
        return this.path.length > 0;
    }

    clearCache() {
        this.last_index = 0
        this.last_time = INFINITE_CACHE
        this.distance_cache = new Float32Array(this.stop_ids.length)
    }

    async getNextPositionAt(time: number): Promise<Coord> {
        if (this.path.length <= 1 || time <= this.stop_timestamps[1] ||
            time >= this.stop_timestamps[this.stop_timestamps.length - 2]) return InvalidCoord;

        let index = 0;
        if (time >= this.last_time) { // Jump stations if time goes forward
            this.last_time = time;
            index = this.last_index;
        }

        while (index < this.stop_timestamps.length) {
            if (this.stop_timestamps[index] >= time)
                break;

            index += 2;
        }
        this.last_index = index;

        const arrival_timestamp = this.stop_timestamps[index];
        const departure_timestamp = this.stop_timestamps[index - 1];
        index = Math.floor((index - 1) / 2);

        if (index >= this.stop_ids.length - 1)
            return InvalidCoord;

        if (time >= arrival_timestamp && time <= departure_timestamp)
            return this.path[this.stop_ids[index]];

        const current_stop_id = this.stop_ids[index];
        const next_stop_id = this.stop_ids[index + 1];
        this.next_stop_id = next_stop_id;

        let total_dist = 0;
        if (this.distance_cache[index] == 0) {
            for (let i = current_stop_id; i < next_stop_id; i++)
                total_dist += dist(this.path[i], this.path[i + 1])

            this.distance_cache[index] = total_dist;
        } else {
            total_dist = this.distance_cache[index];
        }

        const distance = total_dist * timeElapsedPercentage(departure_timestamp, arrival_timestamp, time);

        let current_dist = 0;
        let last_dist = 0;
        let i = current_stop_id;
        for (; i < next_stop_id && current_dist <= distance; i++) {
            last_dist = dist(this.path[i], this.path[i + 1])
            current_dist += last_dist;
        }

        const remaining_distance = current_dist - distance;
        const segment_ratio = (last_dist - remaining_distance) / last_dist;

        return lerpCoord(this.path[i - 1], this.path[i], segment_ratio);
    }
}