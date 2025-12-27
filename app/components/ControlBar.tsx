import { secondsToTimeStr } from "../utils/client-utils";
import { SECONDS_IN_A_DAY } from "../utils/constants";
import { DatePicker } from "./DatePicker";
import { ToggleButton } from "./ToggleButton";

interface ControlBarProps {
  time: number;
  setTime: (time: number) => void;

  timeAutoIncEnabled: boolean;
  setTimeAutoIncEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;
  
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  setIsDragging: (v: boolean) => void;
}

export function ControlBar({time, setTime, timeAutoIncEnabled, setTimeAutoIncEnabled, selectedDate, setSelectedDate, setIsDragging}: ControlBarProps) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: "14px" }}>
        <ToggleButton
          textOn="⏸️"
          textOff="▶️"
          isOn={timeAutoIncEnabled}
          onToggle={() => setTimeAutoIncEnabled((v) => !v)}
        />

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

      <div
        style={{
          position: "fixed",
          bottom: 35,
          right: 20,
          zIndex: 1000,
        }}
      >
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          minYear={2024}
          maxYear={2025}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: "2px" }}>Time: {secondsToTimeStr(time)}</div>
    </>
  );
}
