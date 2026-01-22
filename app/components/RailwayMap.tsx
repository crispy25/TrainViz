"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { isDaytime, secondsToHM } from "../utils/client-utils";
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
  const [intervalTimeout, setIntervalTimeout] = useState(1);
  const intervalRef = useRef<number | null>(null);

  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [selectedStations, setSelectedStations] = useState<Station[]>([]);
  const [selectedRouteCoords, setSelectedRouteCoords] = useState<Coord[]>([]);
  const [stationTab, setStationTab] = useState<"arrivals" | "departures">("arrivals");

  const isGuest = typeof window !== "undefined" && localStorage.getItem("authMode") === "guest";

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
        const newTime = prev + 1;
        if (newTime >= SECONDS_IN_A_DAY) {
          const newDate = new Date(selectedDate);
          newDate.setDate(selectedDate.getDate() + 1);
          setSelectedDate(newDate);
          return 0;
        }
        return newTime; 
      })}, intervalTimeout);
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

  const trainsForStation = (stationName: string) =>
  (stationTab === "arrivals"
    ? trainManager?.getUpcomingArrivalsForStation(stationName)
    : trainManager?.getUpcomingDeparturesForStation(stationName)
  ) ?? [];
  
  return (
  <div style={{ height: "100vh", width: "100%", position: "relative" }}>
    <Link
      href="/statistics"
      className="absolute top-5 right-5 z-[1000] bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-5 py-2.5 rounded-lg shadow-lg font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
      View Statistics
    </Link>
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
        {/* <Popup> */}
        <Popup maxWidth={480} className="my-popup">
          {/* Nume stație */}
          <div style={{ fontSize: 15, fontWeight: "bold" }}>
            {isDaytime(time) ? "🏙️" : "🌆"} {station.name}
          </div>

          {/* Coordonate */}
          <div style={{ fontSize: 12, marginBottom: 6 }}>
            {station.lat.toFixed(5)}, {station.lng.toFixed(5)}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <button
              onClick={() => setStationTab("arrivals")}
              style={{
                padding: "3px 10px",
                borderRadius: 4,
                border: "1px solid #aaa",
                backgroundColor: stationTab === "arrivals" ? "#000" : "#fff",
                color: stationTab === "arrivals" ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              Arrivals
            </button>

            <button
              onClick={() => setStationTab("departures")}
              style={{
                padding: "3px 10px",
                borderRadius: 4,
                border: "1px solid #aaa",
                backgroundColor: stationTab === "departures" ? "#000" : "#fff",
                color: stationTab === "departures" ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              Departures
            </button>
          </div>


          {/* List of trains */}
          <div
            style={{
              maxHeight: 120,
              overflowY: "auto",
              fontSize: 12,
              paddingRight: 4,
            }}
          >
            {trainsForStation(station.name).map((t) => (
              <div
                key={t.id}
                style={{
                  marginBottom: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                backgroundColor:
                  (stationTab === "arrivals" && station.name === t.to) ||
                  (stationTab === "departures" && station.name === t.from)
                    ? "rgba(246, 249, 84, 0.12)"
                    : "none",
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {/* Tren */}
                  <div style={{ width: 75}}>
                    🚆 {t.name}
                  </div>

                  {/* ETA */}
                  <div style={{ width: 85}}>
                    | ⏱️ {secondsToHM((t.eta ?? t.dt) ?? 0)}
                  </div>

                  {/* Rută */}
                  <div style={{ flexGrow: 1 }}>
                    | 🛤️ {t.from} → {t.to}
                  </div>
                </div>
              </div>
            ))}

            {trainsForStation(station.name).length === 0 && (
              <div>No trains</div>
            )}

          </div>

        </Popup>
      </Marker>
    ))}
    </MapContainer>

    {/* Control Bar */}
    <ControlBar time={time} setTime={setTime} timeAutoIncEnabled={timeAutoIncEnabled} setTimeAutoIncEnabled={setTimeAutoIncEnabled}
                selectedDate={selectedDate} setSelectedDate={setSelectedDate} intervalTimeout={intervalTimeout} setIntervalTimeout={setIntervalTimeout} 
                trainManager={trainManager} setIsDragging={setIsDragging} isGuest={isGuest}
    />
  </div>
  );
}
