
type ToggleTextButtonProps = {
  textOn: string;
  textOff: string;
  isOn: boolean;
  onToggle: () => void;
  position?: any;
};

export function ToggleButton({textOn, textOff, isOn, onToggle,}: ToggleTextButtonProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontSize: 28,
          lineHeight: 1,
        }}
      >
        {isOn ? textOn : textOff}
      </span>
    </button>
  );
}
