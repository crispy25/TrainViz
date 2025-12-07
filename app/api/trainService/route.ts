import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const pathsFile = path.join(process.cwd(), "public", "paths.json");
  const paths = JSON.parse(fs.readFileSync(pathsFile, "utf8"));

  const stopIdsFile = path.join(process.cwd(), "public", "stops.json");
  const stopIds = JSON.parse(fs.readFileSync(stopIdsFile, "utf8"));

  const timesFile = path.join(process.cwd(), "public", "train_times.json");
  const times = JSON.parse(fs.readFileSync(timesFile, "utf8"));

  const routeIdsFile = path.join(process.cwd(), "public", "train_routes.json");
  const routeIds = JSON.parse(fs.readFileSync(routeIdsFile, "utf8"));

  return NextResponse.json({ paths: paths, times: times, stopIds: stopIds, routeIds: routeIds });
}