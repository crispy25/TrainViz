"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Train } from "../models/Train";
import "./TrainMarker";

function secondsToTime(sec: number): string {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0")
  ].join(":");
}

export default function RailwayMap() {
  // persistent train instance
  const trainRef = useRef<Train | null>(null);
  if (!trainRef.current) {
    trainRef.current = new Train(1655, "R", 255);
  }
  const train = trainRef.current;

  const [trainServices, setTrainServices] = useState<any>({});
  const [trainId, setTrainId] = useState<number>(1655);

  const [time, setTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const totalTime = 86400; // 24 hours

  // -------------------------------------
  // LOAD SERVICE DATA ONCE
  // -------------------------------------
  useEffect(() => {
    fetch("/api/trainService")
      .then((res) => res.json())
      .then((data) => {
        setTrainServices(data);

        // initialize with default train
        const routeIndex = data.routeIds[trainId];
        train.setStopTimes(data.times[trainId]);
        train.setRoute(data.paths[routeIndex]);
        train.setStopIds(data.stopIds[routeIndex]);
      });
  }, []);

  // -------------------------------------
  // UPDATE TRAIN WHEN USER SELECTS NEW ONE
  // -------------------------------------
  useEffect(() => {
    if (!trainServices.routeIds) return;

    train.id = trainId;

    const routeIndex = trainServices.routeIds[trainId];

    train.setStopTimes(trainServices.times[trainId]);
    train.setRoute(trainServices.paths[routeIndex]);
    train.setStopIds(trainServices.stopIds[routeIndex]);
  }, [trainId, trainServices]);

  // -------------------------------------
  // TIME INTERVAL TICK
  // -------------------------------------
  useEffect(() => {
    if (!isDragging) {
      intervalRef.current = window.setInterval(() => {
        setTime((prev) => (prev + 1) % totalTime);
      }, 10); // fast tick
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isDragging]);

  const position = train.hasRoute()
    ? train.getNextPositionAt(time)
    : [0, 0];

  const timeStr = secondsToTime(time);

  const trainIds = trainServices.routeIds
    ? Object.keys(trainServices.routeIds)
    : [];

  // -------------------------------------
  // UI
  // -------------------------------------
  return (
    <div style={{ height: "100vh", width: "100%" }}>


      {/* TRAIN SELECTION DROPDOWN */}
      <div style={{ display: "flex", justifyContent: "center", margin: "8px" }}>
        <select
          value={trainId}
          onChange={(e) => setTrainId(Number(e.target.value))}
          style={{ fontSize: "16px", padding: "4px", backgroundColor: "black" }}
        >
          {trainIds.map((id) => (
            <option key={id} value={id}>
              Train {id}
            </option>
          ))}
        </select>
      </div>


      <MapContainer
        center={[45.9432, 24.9668]}
        zoom={7}
        style={{ height: "80%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <TileLayer url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png" />

        <Marker position={[position[0], position[1]]} />
      </MapContainer>

      {/* TIME SLIDER */}
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

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        Time: {timeStr}
      </div>
    </div>
  );
}
