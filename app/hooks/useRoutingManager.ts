import { useEffect, useRef } from "react";
import { RoutingManager } from "../models/RouteManager";
import { TrainStaticDataType } from "../utils/types";

"use client";

export function useRoutingManager() {
  const routingManagerRef = useRef<RoutingManager | null>(null);

  useEffect(() => {
    fetch("/api/v1/trains/static")
        .then((res) => res.json())
        .then((data: TrainStaticDataType) => {
            if (!routingManagerRef.current)
              routingManagerRef.current = new RoutingManager(data.routePaths, data.routeStopIds, data.stopNames);
        });
  }, []);

  return { routingManager: routingManagerRef.current };
}
