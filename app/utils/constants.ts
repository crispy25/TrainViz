import path from "path";
import { Coord } from "./types";

export const SECONDS_IN_A_DAY = 86400; // 24 hours
export const MAX_ACTIVE_TRAINS = 1000;
export const TRAIN_DEFAULT_NAME =  "";
export const STOPS_SEPARATOR =  "->";
export const INVALID_COORD = new Float32Array([-1, -1]) as Coord;
export const DEFAULT_DATE = new Date();
export const INVALID_DATE = new Date(1000, 1);
export const BASE_DATA_DIR = path.join(process.cwd(), "data", "years");
export const EMPTY_PATH = new Float32Array();
export const ALMOST_ZERO = 0.00001;
export const ALMOST_ONE = 0.99;