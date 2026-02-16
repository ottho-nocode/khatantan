import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PhosphorBadgeIcon,
  ICON_NAMES,
} from "@/components/ui/phosphor-badge-icon";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
  color: string;
}

export function IconPicker({ value, onChange, color }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = search
    ? ICON_NAMES.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      )
    : ICON_NAMES;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="h-10 w-full justify-start gap-2"
        >
          {value ? (
            <>
              <PhosphorBadgeIcon iconName={value} color={color} size={20} />
              <span className="text-sm">{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Choisir une icône…</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="mb-2 flex items-center gap-2 rounded-md border px-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="grid max-h-56 grid-cols-7 gap-1 overflow-y-auto">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              title={name}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                value === name
                  ? "bg-primary/15 ring-2 ring-primary"
                  : "hover:bg-muted"
              )}
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
            >
              <PhosphorBadgeIcon iconName={name} color={color} size={22} />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-7 py-4 text-center text-xs text-muted-foreground">
              Aucune icône trouvée
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
