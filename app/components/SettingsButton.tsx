import React, { useState, useRef, useEffect } from "react";
import { NumberSlider } from "./NumberSlider";
import { ToggleButton } from "./ToggleButton";
import { signOut } from "next-auth/react";

interface SettingsButtonProps {
  intervalTimeout: number;
  setIntervalTimeout: (time: number) => void;
  onToggleFavorites?: (value: boolean) => void;
  isGuest?: boolean;
}

export function SettingsButton({
  intervalTimeout,
  setIntervalTimeout,
  onToggleFavorites,
  isGuest,
}: SettingsButtonProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };

    if (settingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsOpen]);

  const handleToggleFavorites = () => {
    setShowFavorites((prev) => {
      const newValue = !prev;
      if (onToggleFavorites) onToggleFavorites(newValue);
      return newValue;
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <ToggleButton
        textOn="⚙️"
        textOff="⚙️"
        isOn={settingsOpen}
        onToggle={() => setSettingsOpen((prev) => !prev)}
      />

      {settingsOpen && (
        <div
          ref={panelRef}
          style={{
            position: "absolute",
            bottom: "128%",
            right: 0,
            padding: 8,
            border: "2px solid",
            borderRadius: 2,
            backgroundColor: "Canvas",
            color: "CanvasText",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: 256,
            zIndex: 1000,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div
              style={{
                fontWeight: 550,
                display: "flex",
                justifyContent: "center",
                backgroundColor: "Canvas",
                color: "CanvasText",
                gap: 4,
              }}
            >
              <span>{"⏱️ Time multiplier"}:</span>
              <span style={{ width: 40, textAlign: "left" }}>
                x{1001 - (intervalTimeout ?? 1)}
              </span>
            </div>

            <NumberSlider
              value={1001 - intervalTimeout}
              min={1}
              max={1000}
              onChange={(value) => setIntervalTimeout(1001 - value)}
            />
          </div>

          {/* Show only favorite trains */}
          {onToggleFavorites && (
            <div
              style={{
                fontWeight: 550,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Show only favorite trains</span>
              <ToggleButton
                textOn="🗹"
                textOff="☐"
                isOn={showFavorites}
                onToggle={handleToggleFavorites}
                fontSize={20}
              />
            </div>
          )}

          {/* Login with Google */}
           {isGuest ? (
            <button
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "1px solid",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={() => {
                localStorage.removeItem("authMode");
                window.location.reload();
              }}
            >
              🔐 Login with Google
            </button>
          ) : (
            <button
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={() => {
                signOut({ redirect: false }).then(() => {
                  localStorage.removeItem("authMode");
                  window.location.reload();
                });
              }}
            > 
              🚪 Logout
            </button>
          )}

        </div>
      )}
    </div>
  );
}
