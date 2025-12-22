"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Train } from "../models/Train";
import "./TrainMarker";
import { Coord, InvalidCoord, Station } from "../utils/types";
import StationIcon from "./StationMarker";
import { secondsToTimeStr, isDaytime } from "../utils/utils";
import { SECONDS_IN_A_DAY } from "../utils/constants";


export default function RailwayMap() {
  const [trainServices, setTrainServices] = useState<any>({});
  const [time, setTime] = useState(0);
  const [positions, setPositions] = useState<{ [id: number]: Coord }>({});
  const [stopNames, setStopNames] = useState<{ [id: string]: string }>({});
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const [selectedTrainId, setSelectedTrainId] = useState<number | null>(null);
  const [selectedStations, setSelectedStations] = useState<Station[]>([]);
  const [selectedRouteCoords, setSelectedRouteCoords] = useState<Coord[]>([]);

  const trainsRef = useRef<{ [id: number]: Train }>({});

  // Load train services
  useEffect(() => {
    fetch("/api/trainService")
      .then((res) => res.json())
      .then((data) => {
        setTrainServices(data);

        // Initialize Train instances for all train IDs
        const trainIds = Object.keys(data.routeIds).slice(1, 100); // For now, show only first 100 routes
        const newTrains: { [id: number]: Train } = {};
        const initialPositions: { [id: number]: Coord } = {};

        trainIds.forEach((idStr) => {
          const id = Number(idStr); 
          const routeId = data.routeIds[id];
            if (routeId in data.paths) {
              const train = new Train(id, "R", 255);
              train.setStopTimes(data.times[id]);
              train.setRoutePath(data.paths[routeId]);
              train.setStopIds(data.stopIds[routeId]);

              newTrains[id] = train;
              initialPositions[id] = InvalidCoord;
          }
        });

        trainsRef.current = newTrains;
        setPositions(initialPositions);
        setStopNames(data.stopNames);
      });
  }, []);

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
    let cancelled = false;

    Object.values(trainsRef.current).forEach(async (train) => {
      if (!train.hasRoute()) return;

      const pos = await train.getNextPositionAt(time);
      if (!cancelled) {
        setPositions((prev) => ({
          ...prev,
          [train.id]: pos
        }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [time]);

  // Calculate stations and the route for the selected train
  useEffect(() => {
    if (
      selectedTrainId === null ||
      !trainServices.routeIds ||
      !trainServices.paths ||
      !trainServices.stopIds
    ) {
      setSelectedStations([]);
      setSelectedRouteCoords([]);
      return;
    }

    const routeIndex = trainServices.routeIds[selectedTrainId];
    if (routeIndex === undefined) {
      setSelectedStations([]);
      setSelectedRouteCoords([]);
      return;
    }

    const path = trainServices.paths[routeIndex];
    const stopIdxs = trainServices.stopIds[routeIndex];

    if (!path || !stopIdxs) {
      setSelectedStations([]);
      setSelectedRouteCoords([]);
      return;
    }

    const stations: Station[] = [];

    (stopIdxs as number[]).forEach((idx) => {
      const coord = path[idx];
      if (!coord) return;
      const key = coord.toString();
      const name = stopNames[key] ?? key;

      stations.push({
        lat: coord[0],
        lng: coord[1],
        name,
      });
    });

    setSelectedStations(stations);
    setSelectedRouteCoords(path as Coord[]);
  }, [selectedTrainId, trainServices, stopNames]);

  const timeStr = secondsToTimeStr(time);
  const trainIds = trainServices.routeIds ? Object.keys(trainServices.routeIds) : [];

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
        {trainIds.map((idStr) => {
          const id = Number(idStr);
          const pos = positions[id];
          const train = trainsRef.current[id];
          return pos && pos != InvalidCoord ?
          <Marker
            key={id}
            position={[pos[0], pos[1]]}
            eventHandlers={{ click: () => setSelectedTrainId(id) }}
          > 
          <Popup offset={[0, -10]}>
            <span style={{ fontSize: "15px", fontWeight: "bold" }}>🚉 Train {id}</span><br />
            <span style={{ fontSize: "12px" }}>
              🛤️ Route: {stopNames[train.path[0].toString()]} - {stopNames[train.path[train.path.length - 1].toString()]}<br />
              ⏭️ Next Stop: {stopNames[train.path[train.next_stop_id].toString()]}
            </span>
          </Popup>
          </Marker> : null;
        })}

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
