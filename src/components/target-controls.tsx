"use client";

import {useEffect, useRef, useState} from "react";
import {Check, ChevronDown} from "lucide-react";
import clsx from "clsx";

export function CompactSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
  ariaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedLabel = options.find(([optionValue]) => optionValue === value)?.[1] ?? options[0]?.[1] ?? "";

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-5 text-ink shadow-none transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/20"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={clsx("h-4 w-4 shrink-0 text-ink/55 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div role="listbox" className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-slate-200 bg-white p-1 text-sm font-normal leading-5 text-ink shadow-none">
          {options.map(([optionValue, label]) => {
            const selected = optionValue === value;
            return (
              <button
                key={optionValue}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
                className={clsx("flex h-8 w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-slate-100", selected && "bg-violet/10 text-violet")}
              >
                <span className="truncate">{label}</span>
                {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function CompactCheckbox({checked, onChange, label}: {checked: boolean; onChange: (checked: boolean) => void; label: string}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx("grid h-4 w-4 place-items-center rounded border border-violet transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/25", checked ? "bg-violet text-white" : "bg-white text-transparent")}
    >
      {checked ? <Check size={12} strokeWidth={3} /> : null}
    </button>
  );
}
