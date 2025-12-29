import { useEffect, useRef } from "react";
import { RoutingManager } from "../models/RoutingManager";
import { LinkPaths, StopCoords } from "../utils/types";

"use client";

export function useRoutingManager(selectedDate: Date) {
  const routingManagerRef = useRef<RoutingManager | null>(null);

  useEffect(() => {
    const year = selectedDate.getFullYear();

    const selectedYear = selectedDate.getFullYear();
    if (routingManagerRef.current?.getLastSelectedDate().getFullYear() === selectedYear)
      return;

    fetch("/api/v1/years/" + year + "/paths")
        .then((res) => res.json())
        .then((data: LinkPaths) => {
          const linkPaths = data;

          fetch("/api/v1/years/" + year + "/stops")
          .then((res) => res.json())
          .then((stopCoords: StopCoords) => {
              if (!routingManagerRef.current)
                routingManagerRef.current = new RoutingManager(selectedDate, linkPaths, stopCoords);
              else
                routingManagerRef.current.updateRoutingData(selectedDate, linkPaths, stopCoords);
          });
        });
    
  }, [selectedDate]);

  return { routingManager: routingManagerRef.current };
}
