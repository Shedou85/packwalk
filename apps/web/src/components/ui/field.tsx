import type { HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

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
      className={cn(
        "mt-2 w-full rounded-2xl border border-[rgba(123,167,209,0.24)] bg-white/72 px-4 py-3 text-[var(--text-strong)] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:bg-white/88 focus:shadow-[0_0_0_4px_rgba(77,168,218,0.14)]",
        className,
      )}
      {...props}
    />
  );
}

export function SelectInput({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "mt-2 w-full rounded-2xl border border-[rgba(123,167,209,0.24)] bg-white/72 px-4 py-3 text-[var(--text-strong)] outline-none transition-[border-color,box-shadow,background-color] focus:border-[var(--accent)] focus:bg-white/88 focus:shadow-[0_0_0_4px_rgba(77,168,218,0.14)]",
        className,
      )}
      {...props}
    />
  );
}
