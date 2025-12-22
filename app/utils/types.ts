
export type Coord = Float32Array & { length: 2 };

export type Station = {
  lat: number;
  lng: number;
  name: string;
};

export type TrainServiceTimesDataType = { [id: number] : Int32Array };
export type TrainRouteDataType = { [id: number] : number };
export type TrainDynamicDataType = {
  trainTimes: TrainServiceTimesDataType,
  trainRoutes: TrainRouteDataType
};

export type RoutePathsDataType = { [id: number] : Coord[] };
export type RouteStopIdsDataType = { [id: number] : Int32Array };
export type StopNamesDataType = { [id: string] : string };
export type TrainStaticDataType = {
  routePaths: RoutePathsDataType,
  routeStopIds: RouteStopIdsDataType,
  stopNames: StopNamesDataType
};

export const enum Days {
  Sunday    = 1 << 0,
  Monday    = 1 << 1,
  Tuesday   = 1 << 2,
  Wednesday = 1 << 3,
  Thursday  = 1 << 4,
  Friday    = 1 << 5,
  Saturday  = 1 << 6,
}