import { useEffect, useRef, useState } from "react";
import { TrainManager } from "../models/TrainManager";
import { RoutingManager } from "../models/RouteManager";
import { TrainDynamicDataType } from "../utils/types";
import { DEFAULT_YEAR } from "../utils/constants";

"use client";

export function useTrainManager(routingManager: RoutingManager | null) {
	const trainManagerRef = useRef<TrainManager | null>(null);
	const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);

	useEffect(() => {
		if (!routingManager)
			return;

		if (!trainManagerRef.current)
			trainManagerRef.current = new TrainManager(routingManager);

		fetch("/api/v1/trains/years/" + selectedYear)
			.then((res) => res.json())
			.then((data: TrainDynamicDataType) => {
				trainManagerRef.current?.updateTrainData(data.trainTimes, data.trainRoutes, data.trainServices, data.trainShortnames);
			});
	}, [routingManager]);

	return { trainManager: trainManagerRef.current };
}
