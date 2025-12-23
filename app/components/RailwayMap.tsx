"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { secondsToTimeStr, isDaytime } from "../utils/utils";
import { SECONDS_IN_A_DAY } from "../utils/constants";
import { useRoutingManager } from "../hooks/useRoutingManager";
import { useTrainManager } from "../hooks/useTrainManager";
import { Coord, Station } from "../utils/types";
import StationIcon from "./StationMarker";
import { TrainMarkers } from "./TrainMarkers";


export default function RailwayMap() {
	const { routingManager } = useRoutingManager();
	const { trainManager } = useTrainManager(routingManager);

	const [time, setTime] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const intervalRef = useRef<number | null>(null);

	const [selectedTrainId, setSelectedTrainId] = useState<number | null>(null);
	const [selectedStations, setSelectedStations] = useState<Station[]>([]);
	const [selectedRouteCoords, setSelectedRouteCoords] = useState<Coord[]>([]);

  	// Update time interval
	useEffect(() => {
		if (!isDragging) {
			intervalRef.current = window.setInterval(() => {
			setTime((prev) => (prev + 5) % SECONDS_IN_A_DAY);
			}, 50); // adjust speed here
		}

		return () => {
			if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
			}
		};
	}, [isDragging]);

	// Update all train positions
	useEffect(() => {
		trainManager.updateTrainPositions(time);
	}, [time]);

  // Calculate stations and the route for the selected train
  useEffect(() => {
	if (selectedTrainId === null) {
	  setSelectedStations([]);
	  setSelectedRouteCoords([]);
	  return;
	}

	const routeIndex = trainManager.getTrainRouteId(selectedTrainId);
	if (routeIndex === undefined) {
	  setSelectedStations([]);
	  setSelectedRouteCoords([]);
	  return;
	}

	const path = routingManager.getRoutePath(routeIndex);
	const stopIdxs = routingManager.getRouteStopIds(routeIndex);

	if (!path || !stopIdxs) {
	  setSelectedStations([]);
	  setSelectedRouteCoords([]);
	  return;
	}

	const stations: Station[] = [];

	(stopIdxs as Int32Array).forEach((idx) => {
	  const coord = path[idx];
	  if (!coord) return;
	  const key = coord.toString();
	  const name = routingManager.getStopName(key) ?? key;

	  stations.push({
		lat: coord[0],
		lng: coord[1],
		name,
	  });
	});

	setSelectedStations(stations);
	setSelectedRouteCoords(path as Coord[]);
  }, [selectedTrainId]);

  const timeStr = secondsToTimeStr(time);

  return (
	<div style={{ height: "100vh", width: "100%" }}>
	  {/* Map */}
	  <MapContainer
		center={[45.9432, 24.9668]}
		zoom={7}
		style={{ height: "90%", width: "100%" }}
	  >
		<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
		<TileLayer url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png" />

		{/* Highlight selected train route */}
		{selectedRouteCoords.length > 0 && (
		  <Polyline
			positions={selectedRouteCoords.map((coord) => [coord[0], coord[1]])}
			pathOptions={{ color: "red", weight: 4 }}
		  />
		)}

		{/* Trains */}
		{<TrainMarkers trainManager={trainManager} routingManager={routingManager} setSelectedTrainId={setSelectedTrainId}/>}

		{/* Selected train's stations */}
		{selectedStations.map((station, idx) => (
		  <Marker
			key={`station-${selectedTrainId}-${idx}`}
			position={[station.lat, station.lng]}
			icon={StationIcon}
		  >
			<Popup>
			  <span style={{ fontSize: "15px", fontWeight: "bold" }}>
				{isDaytime(time) ? "🏙️" : "🌆"} {station.name}
			  </span>
			  <br />
			  <span style={{ fontSize: "12px" }}>
				{station.lat.toFixed(5)}, {station.lng.toFixed(5)}
			  </span>
			</Popup>
		  </Marker>
		))}
	  </MapContainer>

	  {/* Time slider */}
	  <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
		<input
		  type="range"
		  min={0}
		  max={SECONDS_IN_A_DAY}
		  step={1}
		  value={time}
		  style={{ width: "60%" }}
		  onMouseDown={() => setIsDragging(true)}
		  onMouseUp={() => setIsDragging(false)}
		  onChange={(e) => setTime(Number(e.target.value))}
		/>
	  </div>

	  <div style={{ textAlign: "center", marginTop: "10px" }}>Time: {timeStr}</div>
	</div>
  );
}
