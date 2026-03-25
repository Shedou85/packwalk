import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

const buttonVariants = {
  primary:
    "bg-[linear-gradient(135deg,#4da8da_0%,#256ea8_100%)] text-white shadow-[0_10px_24px_rgba(77,168,218,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(77,168,218,0.32)]",
  secondary:
    "border border-[rgba(123,167,209,0.28)] bg-white/65 text-[var(--text-strong)] hover:bg-white/80",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof buttonVariants;
};

export function Button({
  className,
  variant = "primary",
  type = "submit",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "cursor-pointer rounded-full px-5 py-3 text-sm font-medium transition-[transform,box-shadow,background-color]",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: keyof typeof buttonVariants;
};

export function ButtonLink({
  href,
  children,
  className,
  variant = "secondary",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-[transform,box-shadow,background-color]",
        buttonVariants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
