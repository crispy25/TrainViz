
export type Coord = Float32Array & { length: 2 };
export const ZeroCoord = new Float32Array(2) as Coord;
export const InvalidCoord = new Float32Array([-1, -1]) as Coord;