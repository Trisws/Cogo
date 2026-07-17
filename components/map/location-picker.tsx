"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { geocodeAddress, type GeocodeResult } from "@/lib/geo";
import { cn } from "@/lib/utils";

export function LocationPicker({
  placeholder,
  value,
  onSelect,
  icon,
}: {
  placeholder: string;
  value?: GeocodeResult | null;
  onSelect: (r: GeocodeResult) => void;
  icon?: React.ReactNode;
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value?.label]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!open || query.trim().length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const r = await geocodeAddress(query);
      setResults(r);
      setLoading(false);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
        {icon ?? <Search className="size-4 text-muted-foreground" />}
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="h-6 border-0 p-0 shadow-none focus-visible:ring-0"
        />
        {loading && <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />}
      </div>
      {open && (results.length > 0 || loading) && (
        <div className="absolute inset-x-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
          {results.map((r, i) => (
            <button
              key={i}
              className={cn(
                "flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs hover:bg-muted",
                i !== results.length - 1 && "border-b border-border"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(r);
                setQuery(r.label);
                setOpen(false);
              }}
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand-green" />
              <span className="line-clamp-2">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
