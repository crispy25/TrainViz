import { useEffect, useRef } from "react";
import { TrainManager } from "../models/TrainManager";
import { RoutingManager } from "../models/RoutingManager";
import { TrainRegistry } from "../utils/types";

"use client";

export function useTrainManager(routingManager: RoutingManager | null, selectedDate: Date) {
  const trainManagerRef = useRef<TrainManager | null>(null);

  useEffect(() => {
    if (!routingManager)
      return;

    const selectedYear = selectedDate.getFullYear();
    if (trainManagerRef.current?.getLastSelectedDate().getFullYear() === selectedYear) {
      if (trainManagerRef.current.getLastSelectedDate().getDay() !== selectedDate.getDay())
        trainManagerRef.current.updateActiveTrains(selectedDate);
      return;
    }
  
    fetch("/api/v1/years/" + selectedYear + "/trains")
      .then((res) => res.json())
      .then((data: TrainRegistry) => {
        if (!trainManagerRef.current)
          trainManagerRef.current = new TrainManager(routingManager);
        trainManagerRef.current?.updateTrainData(selectedDate, data);
      })
      .catch((_) => {
        trainManagerRef.current?.updateTrainData(selectedDate, {});
      });
  }, [routingManager, selectedDate]);

  return { trainManager: trainManagerRef.current };
}
