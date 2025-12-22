import { TrainDynamicDataType } from "@/app/utils/types";
import { NextResponse } from "next/server";
import { stringToIntKeysDict, stringToIntValuesDict } from "@/app/utils/utils";
import fs from "fs/promises";
import path from "path";

type Params = {
  params: Promise<{ year: string }>;
};

const BASE_DIR = path.join(process.cwd(), "data", "trains", "years");

async function readJSON(file: string, year: string) {
  return JSON.parse(await fs.readFile(path.join(BASE_DIR, year, file), "utf8"));
}

export async function GET(_req: Request, { params }: Params) {
  const { year } = await params;

  const [trainTimesJSON, trainRoutesJSON, trainServicesJSON, trainShortnamesJSON] = await Promise.all([
    readJSON("train_id_times.json", year),
    readJSON("train_id_route_id.json", year),
    readJSON("train_id_service_id.json", year),
    readJSON("train_id_shortname.json", year),
  ]);

  const trainTimes = stringToIntKeysDict(trainTimesJSON);
  const trainRoutes = stringToIntValuesDict(stringToIntKeysDict(trainRoutesJSON));
  const trainServices = stringToIntValuesDict(stringToIntKeysDict(trainServicesJSON));
  const trainShortnames = stringToIntKeysDict(trainShortnamesJSON);

  try {
    return NextResponse.json<TrainDynamicDataType>(
      { trainTimes, trainRoutes, trainServices, trainShortnames },
      {
        // TODO: Add caching
        // headers: {
        //   "Cache-Control": "public, max-age=3600",
        // },
      }
    );
  } catch {
    return NextResponse.json(
      { error: `Train data not found for year ${year}` },
      { status: 404 }
    );
  }
}
