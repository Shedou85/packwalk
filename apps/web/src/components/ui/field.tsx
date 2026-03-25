import type { HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

const controlClasses =
  "mt-2 w-full rounded-2xl border border-[rgba(123,167,209,0.24)] bg-white/72 px-4 py-3 text-[var(--text-strong)] outline-none transition-[border-color,box-shadow,background-color,transform] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:bg-white/88 focus:shadow-[0_0_0_4px_rgba(77,168,218,0.14)]";

type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  children,
  className,
  ...props
}: FieldProps) {
  return (
    <div className={className} {...props}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-[var(--text-strong)]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(controlClasses, className)}
      {...props}
    />
  );
}

export function SelectInput({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative mt-2">
      <select
        className={cn(
          controlClasses,
          "mt-0 appearance-none pr-11",
          className,
        )}
        {...props}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center">
        <div className="rounded-full border border-[rgba(123,167,209,0.2)] bg-white/55 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 text-[var(--accent-strong)]"
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
      </div>
    </div>
  );
}
