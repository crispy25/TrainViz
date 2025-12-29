
export type Coord = Float32Array & { length: 2 };
export type Path = Float32Array;

export type Station = {
  lat: number;
  lng: number;
  name: string;
};

export type LinkPaths = { [id: string] : Path };
export type StopCoords = { [id: string] : Coord };
export type TrainMetadata = { name: string, activeDays: number, stopNames: string[], stopTimes: Int32Array };
export type TrainRegistry = { [id: string] : TrainMetadata };
