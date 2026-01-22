type DatePickerProps = {
  value: Date;
  onChange: (newDate: Date) => void;
  minYear: number;
  maxYear: number;
};

export function DatePicker({ value, onChange, minYear, maxYear }: DatePickerProps) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    return `${y}-${m}-${d}`;
  };

  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <input
      type="date"
      value={formatDate(value)}
      onChange={(e) => onChange(new Date(e.target.value))}
      min={`${minYear}-01-01`}
      max={`${maxYear}-12-31`}
      style={{
        backgroundColor: isDark ? "#000000" : "#ffffff",
        color: isDark ? "#ffffff" : "#000000",
        colorScheme: isDark ? "dark" : "light",
        border: "2px solid",
        borderRadius: "8px",
        padding: "0px 8px",
    }}
    />
  );
}
