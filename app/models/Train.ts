import { INFINITE_CACHE } from "next/dist/lib/constants";
import { Coord, InvalidCoord } from "./Coord";

function dist(a: Coord, b: Coord): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
}


function timeElapsedPercentage(departureTime: number, arrivalTime: number, currentTime: number): number {
    if (arrivalTime <= departureTime) return 1;
    const elapsed = currentTime - departureTime;
    const total = arrivalTime - departureTime;
    let percent = (elapsed / total);

    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;

    return percent;
}


function lerpCoord(a: Coord, b: Coord, t: number): Coord {
    const r = new Float32Array(2) as Coord;
    r[0] = a[0] + t * (b[0] - a[0]);
    r[1] = a[1] + t * (b[1] - a[1]);
    return r;
}


export class Train {
    id: number
    shortname: string
    service_day_mask: number
    route: Coord[] = []
    stop_ids: Int32Array = new Int32Array()
    stop_timestamps: Int32Array = new Int32Array()

    last_time: number = INFINITE_CACHE
    last_index: number = 0

    distance_cache: Int32Array = new Int32Array()

    constructor(id: number, shortname: string, service_day_mask: number) {
        this.id = id;
        this.shortname = shortname;
        this.service_day_mask = service_day_mask;
    }

    setRoute(route: Coord[]) {
        this.route = route;
    }

    setStopTimes(stops_timestamps: Int32Array) {
        this.stop_timestamps = stops_timestamps;
    }

    setStopIds(stop_ids: Int32Array) {
        this.stop_ids = stop_ids;
        this.distance_cache = new Int32Array(stop_ids.length)
    }

    hasRoute(): boolean {
        return this.route.length > 0;
    }

    async getNextPositionAt(time: number): Promise<Coord> {
        if (this.route.length === 0) return InvalidCoord;
        if (this.route.length === 1 || time <= this.stop_timestamps[1]) return InvalidCoord;
        if (time >= this.stop_timestamps[this.stop_timestamps.length - 2]) return InvalidCoord;

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
            return this.route[this.stop_ids[index]];

        const current_station_id = this.stop_ids[index];
        const next_station_id = this.stop_ids[index + 1];

        let total_dist = 0;
        if (this.distance_cache[index] == 0) {
            for (let i = current_station_id; i < next_station_id; i++)
                total_dist += dist(this.route[i], this.route[i + 1])

            this.distance_cache[index] = total_dist;
        } else {
            total_dist = this.distance_cache[index];
        }

        const time_ratio = timeElapsedPercentage(departure_timestamp, arrival_timestamp, time);
        const distance = total_dist * time_ratio;

        let current_dist = 0;
        let i = current_station_id;
        let last_dist = 0;
        for (; i < next_station_id && current_dist <= distance; i++) {
            last_dist = dist(this.route[i], this.route[i + 1])
            current_dist += last_dist;
        }

        const remaining_distance = current_dist - distance;
        const segment_ratio = (last_dist - remaining_distance) / last_dist;

        return lerpCoord(this.route[i - 1], this.route[i], segment_ratio);
    }
}