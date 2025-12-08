"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Train } from "../models/Train";
import "./TrainMarker";
import { Coord, InvalidCoord } from "../models/Coord";

function secondsToTime(sec: number): string {
  const h = (sec / 3600) | 0;
  const m = ((sec / 60) | 0) % 60;
  const s = sec % 60;

  return (h < 10 ? "0" : "") + h +
         ":" +
         (m < 10 ? "0" : "") + m +
         ":" +
         (s < 10 ? "0" : "") + s;
}

export default function RailwayMap() {
  const [trainServices, setTrainServices] = useState<any>({});
  const [time, setTime] = useState(0);
  const [positions, setPositions] = useState<{ [id: number]: Coord }>({});
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const totalTime = 86400; // 24 hours
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
          const routeIndex = data.routeIds[id];
            if (routeIndex in data.paths) {
              const train = new Train(id, "R", 255);
              train.setStopTimes(data.times[id]);
              train.setRoute(data.paths[routeIndex]);
              train.setStopIds(data.stopIds[routeIndex]);

              newTrains[id] = train;
              initialPositions[id] = InvalidCoord;
          }
        });

        trainsRef.current = newTrains;
        setPositions(initialPositions);
      });
  }, []);

  // Update time interval
  useEffect(() => {
    if (!isDragging) {
      intervalRef.current = window.setInterval(() => {
        setTime((prev) => (prev + 5) % totalTime);
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

  const timeStr = secondsToTime(time);
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

        {trainIds.map((idStr) => {
          const id = Number(idStr);
          const pos = positions[id];
          return pos && pos != InvalidCoord ? <Marker key={id} position={[pos[0], pos[1]]} /> : null;
        })}
      </MapContainer>

      {/* Time slider */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
        <input
          type="range"
          min={0}
          max={totalTime}
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
