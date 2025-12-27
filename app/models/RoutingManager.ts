import { distanceBetween } from "../utils/client-utils";
import { EMPTY_PATH, INVALID_DATE, STOPS_SEPARATOR } from "../utils/constants";
import { Coord, LinkPathsDataType, StopCoordsDataType } from "../utils/types";


export class RoutingManager {
  private linkPaths: LinkPathsDataType = {};
  private stopCoords: StopCoordsDataType = {};
  private linkDistances: { [id: string] : number } = {};
  private lastSelectedDate: Date = INVALID_DATE;

  constructor(date: Date, linkPaths: LinkPathsDataType, stopCoords: StopCoordsDataType) {
    this.updateRoutingData(date, linkPaths, stopCoords);
  }

  updateRoutingData(date: Date, linkPaths: LinkPathsDataType, stopCoords: StopCoordsDataType) {
    this.lastSelectedDate = date;
    this.linkPaths = linkPaths;
    this.stopCoords = stopCoords;

    Object.keys(linkPaths).forEach((link) => {
      const path = linkPaths[link];

      let total_dist = 0;
      for (let i = 0; i < path.length - 3; i += 2)
        total_dist += distanceBetween(path[i], path[i + 1], path[i + 2], path[i + 3])

      this.linkDistances[link] = total_dist;
    });
  }

  getPathBetweenStops(stops: string[]) {
    let path: Coord[] = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const direction = stops[i].concat(STOPS_SEPARATOR, stops[i + 1]);
      const segmentPathFlattened = this.linkPaths[direction]

      for (let j = 0; j < segmentPathFlattened.length; j += 2) {
        const coord = new Float32Array(2) as Coord;
        coord[0] = segmentPathFlattened[j];
        coord[1] = segmentPathFlattened[j + 1];
        path.push(coord as Coord);
      }
    }

    return path;
  }

  getLinkPath(stopA: string, stopB: string) {
    const direction = stopA.concat(STOPS_SEPARATOR, stopB);
    return this.linkPaths[direction] ?? EMPTY_PATH;
  }

  getDistanceBetweenStops(stops: string[]) {
    const distanceBetweenStops = new Float32Array(stops.length)
  
    for (let i = 0; i < stops.length - 1; i++) {
      const direction = stops[i].concat(STOPS_SEPARATOR, stops[i + 1]);
      distanceBetweenStops[i + 1] = this.linkDistances[direction];
    }

    return distanceBetweenStops;
  }

  getStopCoords(stop: string) {
    return this.stopCoords[stop];
  }

  getLastSelectedDate() {
    return this.lastSelectedDate;
  }
}
