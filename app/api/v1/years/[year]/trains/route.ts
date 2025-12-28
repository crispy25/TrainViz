import { NextResponse } from "next/server";
import { dictKeysToInt, readJSON } from "@/app/utils/server-utils";
import { BASE_DATA_DIR } from "@/app/utils/constants";
import { TrainDataType } from "@/app/utils/types";
import path from "path";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ year: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  const { year } = await params;
  const filePath = path.join(BASE_DATA_DIR, year, "train_data.json");

  try {
    const data = await readJSON(filePath);

    return NextResponse.json<TrainDataType>(
      data,
      {
        // TODO: Add caching
        // headers: {
        //   "Cache-Control": "public, max-age=3600",
        // },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Data for year ${year} not found` },
      { status: 404 }
    );
  }
}
