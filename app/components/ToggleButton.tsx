
type ToggleTextButtonProps = {
  textOn: string;
  textOff: string;
  isOn: boolean;
  onToggle: () => void;
  fontSize?: number;
};

export function ToggleButton({textOn, textOff, isOn, onToggle, fontSize = 28}: ToggleTextButtonProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontSize: fontSize,
          lineHeight: 1,
        }}
      >
        {isOn ? textOn : textOff}
      </span>
    </button>
  );
}
