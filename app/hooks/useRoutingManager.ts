import { useEffect, useRef } from "react";
import { RoutingManager } from "../models/RoutingManager";
import { TrainStaticDataType } from "../utils/types";

"use client";

export function useRoutingManager() {
  const routingManagerRef = useRef<RoutingManager>(new RoutingManager());

  useEffect(() => {
    fetch("/api/v1/trains/static")
        .then((res) => res.json())
        .then((data: TrainStaticDataType) => {
            routingManagerRef.current.updateRoutingData(data.routePaths, data.routeStopIds, data.stopNames);
        });
  }, []);

  return { routingManager: routingManagerRef.current };
}
