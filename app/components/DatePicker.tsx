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

  return (
    <input
      type="date"
      value={formatDate(value)}
      onChange={(e) => onChange(new Date(e.target.value))}
      min={`${minYear}-01-01`}
      max={`${maxYear}-12-31`}
      style={{
        backgroundColor: "#ffffffff",
        color: "#000000ff",
        border: "2px solid #ffffffff",
        borderRadius: "8px",
        padding: "0px 8px"
    }}
    />
  );
}
