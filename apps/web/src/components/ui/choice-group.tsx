"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/cn";

type ChoiceOption = {
  label: string;
  value: string;
  description?: string;
};

type ChoiceGroupProps = {
  name: string;
  options: ChoiceOption[];
  defaultValue: string;
  className?: string;
};

export function ChoiceGroup({
  name,
  options,
  defaultValue,
  className,
}: ChoiceGroupProps) {
  const fallbackValue = options[0]?.value ?? "";
  const [value, setValue] = useState(defaultValue || fallbackValue);
  const groupId = useId();

  return (
    <div className={cn("mt-2", className)}>
      <input type="hidden" name={name} value={value} />
      <div
        role="radiogroup"
        aria-labelledby={groupId}
        className="grid gap-2"
      >
        {options.map((option) => {
          const checked = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setValue(option.value)}
              className={cn(
                "cursor-pointer rounded-[22px] border px-4 py-3 text-left transition-[transform,background-color,border-color,box-shadow]",
                checked
                  ? "border-[rgba(77,168,218,0.55)] bg-[linear-gradient(135deg,rgba(77,168,218,0.16)_0%,rgba(37,110,168,0.1)_100%)] shadow-[0_0_0_4px_rgba(77,168,218,0.12)]"
                  : "border-[rgba(123,167,209,0.22)] bg-white/48 hover:bg-white/62",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-strong)]">
                    {option.label}
                  </p>
                  {option.description ? (
                    <p className="mt-1 text-xs leading-5 text-[var(--text-soft)]">
                      {option.description}
                    </p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "mt-0.5 h-4 w-4 rounded-full border transition-colors",
                    checked
                      ? "border-[var(--accent-strong)] bg-[var(--accent)]"
                      : "border-[rgba(123,167,209,0.4)] bg-white/80",
                  )}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
