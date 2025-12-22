import { NextResponse } from "next/server";
import { TrainStaticDataType } from "@/app/utils/types";
import { stringToIntKeysDict } from "@/app/utils/utils";
import fs from "fs/promises";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "data", "trains", "static");

async function readJSON(file: string) {
  return JSON.parse(await fs.readFile(path.join(BASE_DIR, file), "utf8"));
}

export async function GET() {
  try {
    const [routePathsJSON, routeStopIdsJSON, stopNames] = await Promise.all([
      readJSON("route_id_path_coords.json"),
      readJSON("route_id_stop_indices.json"),
      readJSON("coord_stop_name.json")
    ]);

    const routePaths = stringToIntKeysDict(routePathsJSON);
    const routeStopIds = stringToIntKeysDict(routeStopIdsJSON);

    return NextResponse.json<TrainStaticDataType>(
      { routePaths, routeStopIds, stopNames },
      {
        // TODO: Add caching
        // headers: {
        //   "Cache-Control": "public, max-age=3600",
        // },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Static train data not found" },
      { status: 404 }
    );
  }
}
