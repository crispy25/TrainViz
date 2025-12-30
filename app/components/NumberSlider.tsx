export interface NumberSliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function NumberSlider({value, min, max, step = 1, onChange}: NumberSliderProps) {
  return (
    <div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          cursor: "pointer",
          accentColor: "#ffffffff",
          height: 8,
          width: "100%",
        }}
      />
    </div>
  );
};
