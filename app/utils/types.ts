
export type Coord = Float32Array & { length: 2 };
export type Path = Float32Array;

export type Station = {
  lat: number;
  lng: number;
  name: string;
};

export type LinkPathsDataType = { [id: string] : Path };
export type StopCoordsDataType = { [id: string] : Coord };
export type TrainMetaDataType = { name: string, activeDays: number, stopNames: string[], stopTimes: Int32Array };
export type TrainDataType = { [id: string] : TrainMetaDataType };
