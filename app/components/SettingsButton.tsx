import React, { useState, useRef, useEffect } from "react";
import { NumberSlider } from "./NumberSlider";
import { ToggleButton } from "./ToggleButton";

interface SettingsButtonProps {
  intervalTimeout: number;
  setIntervalTimeout: (time: number) => void;
}

export function SettingsButton({ intervalTimeout, setIntervalTimeout }: SettingsButtonProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
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
            border: "2px solid #ffffffff",
            borderRadius: 2,
            backgroundColor: "#000000ff",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: 256,
            zIndex: 1000,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                fontWeight: 550,
                display: "flex",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <span>{"⏱️ Time multiplier"}:</span>
              <span style={{ width: 40, textAlign: "left" }}>
                x{(intervalTimeout ?? 0) / 1000}
              </span>
            </div>

            <NumberSlider
              value={intervalTimeout}
              min={1}
              max={1000}
              onChange={setIntervalTimeout}
            />
          </div>
        </div>
      )}
    </div>
  );
}
