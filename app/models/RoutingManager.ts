import { Coord, RoutePathsDataType, RouteStopIdsDataType, StopNamesDataType } from "../utils/types";


export class RoutingManager {
  private staticRoutePaths: { [id: number] : Coord[] } = {};
  private staticRouteStopIds: { [id: number] : Int32Array } = {};
  private staticStopNames: { [id: string] : string } = {};

  updateRoutingData(routePaths: RoutePathsDataType, routeStopIds: RouteStopIdsDataType, stopNames: StopNamesDataType) {
      this.staticRoutePaths = routePaths;
      this.staticRouteStopIds = routeStopIds;
      this.staticStopNames = stopNames;
  }

  getRoutePath(route_id: number) {
      return this.staticRoutePaths[route_id];
  }

  getRouteStopIds(route_id: number) {
      return this.staticRouteStopIds[route_id];
  }

  getStopName(coords: string) {
      return this.staticStopNames[coords];
  }
}
