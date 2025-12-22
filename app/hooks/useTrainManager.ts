import { useEffect, useRef, useState } from "react";
import { TrainManager } from "../models/TrainManager";
import { RoutingManager } from "../models/RoutingManager";
import { TrainDynamicDataType } from "../utils/types";
import { DEFAULT_YEAR } from "../utils/constants";

"use client";

export function useTrainManager(routingManager: RoutingManager) {
	const trainManagerRef = useRef<TrainManager>(new TrainManager(routingManager));
	const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);

	useEffect(() => {
		fetch("/api/v1/trains/years/" + selectedYear)
			.then((res) => res.json())
			.then((data: TrainDynamicDataType) => {
				trainManagerRef.current.updateTrainData(data.trainTimes, data.trainRoutes, data.trainServices, data.trainShortnames);
			});
	}, []);

	return { trainManager: trainManagerRef.current };
}
