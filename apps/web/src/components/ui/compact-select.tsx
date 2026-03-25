"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

type SelectOption = {
  label: string;
  value: string;
  description?: string;
};

type CompactSelectProps = {
  name: string;
  options: SelectOption[];
  defaultValue: string;
  placeholder?: string;
  className?: string;
};

export function CompactSelect({
  name,
  options,
  defaultValue,
  placeholder,
  className,
}: CompactSelectProps) {
  const fallbackValue = defaultValue || options[0]?.value || "";
  const [value, setValue] = useState(fallbackValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative mt-2", className)}>
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-2xl border border-[rgba(123,167,209,0.24)] bg-white/72 px-4 py-3 text-left text-[var(--text-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] outline-none transition-[border-color,box-shadow,background-color] hover:bg-white/84 focus:border-[var(--accent)] focus:bg-white/88 focus:shadow-[0_0_0_4px_rgba(77,168,218,0.14)]"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--text-strong)]">
            {selectedOption?.label || placeholder || "Select"}
          </p>
          {selectedOption?.description ? (
            <p className="mt-1 truncate text-xs text-[var(--text-soft)]">
              {selectedOption.description}
            </p>
          ) : null}
        </div>

        <div className="ml-3 rounded-full border border-[rgba(123,167,209,0.2)] bg-white/55 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={cn(
              "h-3.5 w-3.5 text-[var(--accent-strong)] transition-transform",
              open ? "rotate-180" : "",
            )}
            fill="none"
          >
            <path
              d="M4 6.5L8 10L12 6.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[22px] border border-[rgba(123,167,209,0.24)] bg-[rgba(244,250,255,0.96)] p-2 shadow-[0_18px_40px_rgba(50,83,116,0.18)] backdrop-blur-xl">
          <div role="listbox" className="grid gap-1">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setValue(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer rounded-[18px] px-3 py-3 text-left transition-[background-color,box-shadow]",
                    active
                      ? "bg-[linear-gradient(135deg,rgba(77,168,218,0.16)_0%,rgba(37,110,168,0.08)_100%)] shadow-[inset_0_0_0_1px_rgba(77,168,218,0.28)]"
                      : "hover:bg-white/80",
                  )}
                >
                  <p className="text-sm font-medium text-[var(--text-strong)]">
                    {option.label}
                  </p>
                  {option.description ? (
                    <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">
                      {option.description}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
