"use client";

import { useFavorite } from "../hooks/useFavorite";
import { ToggleButton } from "./ToggleButton";

type FavoriteButtonProps = { trainId: string };

export function FavoriteButton({ trainId }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorite(trainId);

  return (
    <ToggleButton
      textOn="❤️"
      textOff="🤍"
      isOn={isFavorite}
      onToggle={toggleFavorite}
      fontSize={14}
    />
  );
}
