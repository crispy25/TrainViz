import { useState, useEffect } from "react";

export function useFavorite(trainId: string) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function fetchFavorite() {
      const res = await fetch("/api/v1/favorites");
      if (!res.ok) return;

      const data = await res.json();
      setIsFavorite(data.favoriteTrainIds.includes(trainId));
    }

    fetchFavorite();
  }, [trainId]);

  async function toggleFavorite() {
    const res = await fetch("/api/v1/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainId }),
    });
    if (res.ok) {
      const data = await res.json();
      setIsFavorite(data.favorite);
    }
  }

  return { isFavorite, toggleFavorite };
}