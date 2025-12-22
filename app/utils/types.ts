
export type Coord = Float32Array & { length: 2 };

export type Station = {
  lat: number;
  lng: number;
  name: string;
};

export type TrainStopTimesDataType = { [id: number] : Int32Array };
export type TrainRoutesDataType = { [id: number] : number };
export type TrainServicesDataType = { [id: number] : number };
export type TrainShortnamesDataType = { [id: number] : string };
export type TrainDynamicDataType = {
  trainTimes: TrainStopTimesDataType,
  trainRoutes: TrainRoutesDataType,
  trainServices: TrainServicesDataType,
  trainShortnames: TrainShortnamesDataType
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