"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { isDaytime } from "../utils/client-utils";
import { DEFAULT_DATE, INVALID_COORD, SECONDS_IN_A_DAY } from "../utils/constants";
import { useRoutingManager } from "../hooks/useRoutingManager";
import { useTrainManager } from "../hooks/useTrainManager";
import { Coord, Station } from "../utils/types";
import { TrainMarkers } from "./TrainMarkers";
import StationIcon from "./StationMarker";
import { ControlBar } from "./ControlBar";


export default function RailwayMap() {
  const [time, setTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [timeAutoIncEnabled, setTimeAutoIncEnabled] = useState(true);
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [timeIncValue, setTimeIncValue] = useState(1);
  const [intervalTimeout, setIntervalTimeout] = useState(1);
  const intervalRef = useRef<number | null>(null);

  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [selectedStations, setSelectedStations] = useState<Station[]>([]);
  const [selectedRouteCoords, setSelectedRouteCoords] = useState<Coord[]>([]);

  const { routingManager } = useRoutingManager(selectedDate);
  const { trainManager } = useTrainManager(routingManager, selectedDate);

  // Update time interval
  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeAutoIncEnabled && !isDragging) {
      intervalRef.current = window.setInterval(() => {
      setTime((prev) => {
        const newTime = prev + timeIncValue;
        if (newTime >= SECONDS_IN_A_DAY) {
          const newDate = new Date(selectedDate);
          newDate.setDate(selectedDate.getDate() + 1);
          setSelectedDate(newDate);
          return 0;
        }
        return newTime; 
      })}, intervalTimeout); // adjust speed here
    }
  });

  // Update all train positions
  useEffect(() => {
    trainManager?.updateTrainPositions(time);
  }, [time]);

  // Calculate stations and the route for the selected train
  useEffect(() => {
  if (trainManager === null || selectedTrainId === null) {
    setSelectedStations([]);
    setSelectedRouteCoords([]);
    return;
  }

  const stations: Station[] = [];
  const stopNames = trainManager.getTrain(selectedTrainId).getStopNames() ?? [];
  const path = routingManager?.getPathBetweenStops(stopNames) ?? [];

  stopNames.forEach((name) => {
    const coords = routingManager?.getStopCoords(name) ?? INVALID_COORD;

    stations.push({
      lat: coords[0],
      lng: coords[1],
      name,
    });
  });

  setSelectedStations(stations);
  setSelectedRouteCoords(path);
  }, [selectedTrainId]);

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
    {<TrainMarkers trainManager={trainManager} setSelectedTrainId={setSelectedTrainId}/>}

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
    <ControlBar time={time} setTime={setTime} timeAutoIncEnabled={timeAutoIncEnabled} setTimeAutoIncEnabled={setTimeAutoIncEnabled}
                 selectedDate={selectedDate} setSelectedDate={setSelectedDate} trainOnRouteCount={trainManager?.getTrainsOnRouteCount()}
                 setIsDragging={setIsDragging}
    />
  </div>
  );
}
