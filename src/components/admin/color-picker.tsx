import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

const PRESET_COLORS = [
  { name: "Rose", hex: "#e11d48" },
  { name: "Rouge", hex: "#dc2626" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Ambre", hex: "#d97706" },
  { name: "Jaune", hex: "#ca8a04" },
  { name: "Vert", hex: "#16a34a" },
  { name: "Émeraude", hex: "#059669" },
  { name: "Cyan", hex: "#0891b2" },
  { name: "Bleu", hex: "#2563eb" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Fuchsia", hex: "#c026d3" },
];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-6 gap-1.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            title={c.name}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md border-2 transition-colors",
              value.toLowerCase() === c.hex.toLowerCase()
                ? "border-foreground"
                : "border-transparent hover:border-muted-foreground/40"
            )}
            style={{ backgroundColor: c.hex }}
            onClick={() => onChange(c.hex)}
          >
            {value.toLowerCase() === c.hex.toLowerCase() && (
              <Check className="h-3.5 w-3.5 text-white drop-shadow" />
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-7 w-7 shrink-0 rounded-md border"
          style={{ backgroundColor: value }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#e11d48"
          className="h-7 font-mono text-xs"
        />
      </div>
    </div>
  );
}
