"use client";

import { TrainManager } from "../models/TrainManager";
import { ToggleButton } from "./ToggleButton";

type FavoriteButtonProps = {
  trainId: string;
  trainManager: TrainManager | null;
};

export function FavoriteButton({ trainId, trainManager }: FavoriteButtonProps) {
  if (!trainManager) return null;

  const isOn = trainManager.getFavoriteTrains().includes(trainId);

  const handleToggle = async () => {
    if (!trainManager) return;

    trainManager.toggleFavorite(trainId);

    try {
      await fetch("/api/v1/favorites", {
        method: isOn ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainId }),
      });
    } catch (err) {
      console.error("Failed to update favorite train in DB", err);
      trainManager.toggleFavorite(trainId);
    }
  };

  return (
    <ToggleButton
      textOn="❤️"
      textOff="🤍"
      isOn={isOn}
      onToggle={handleToggle}
      fontSize={14}
    />
  );
}
