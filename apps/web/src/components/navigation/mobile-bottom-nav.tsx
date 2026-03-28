"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

type MobileBottomNavItem = {
  href: string;
  label: string;
  icon: "home" | "map" | "walk" | "groups" | "profile";
};

type MobileBottomNavProps = {
  items: MobileBottomNavItem[];
};

const iconClasses = "h-[18px] w-[18px]";

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="sticky bottom-4 z-20 mt-auto pt-4 sm:hidden">
      <nav
        aria-label="Mobile navigation"
        className="rounded-[26px] border border-[rgba(93,130,166,0.26)] bg-[rgba(225,238,250,0.82)] px-3 py-2 shadow-[0_24px_50px_rgba(40,67,95,0.24),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-[22px]"
      >
        <ul
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[64px] flex-col items-center justify-center rounded-[20px] px-2 py-2 text-center transition-[background-color,transform,box-shadow,color]",
                    active
                      ? "bg-[linear-gradient(135deg,rgba(77,168,218,0.24)_0%,rgba(37,110,168,0.16)_100%)] text-[var(--accent-strong)] shadow-[inset_0_0_0_1px_rgba(77,168,218,0.3)]"
                      : "text-[var(--text-soft)] hover:bg-white/42 hover:text-[var(--text-strong)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border transition-[background-color,border-color]",
                      active
                        ? "border-[rgba(77,168,218,0.24)] bg-white/78"
                        : "border-[rgba(109,150,189,0.2)] bg-[rgba(255,255,255,0.34)]",
                    )}
                  >
                    <NavIcon icon={item.icon} />
                  </span>
                  <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function NavIcon({ icon }: { icon: MobileBottomNavItem["icon"] }) {
  if (icon === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClasses} aria-hidden="true">
        <path
          d="M4 10.5L12 4L20 10.5V19C20 19.55 19.55 20 19 20H5C4.45 20 4 19.55 4 19V10.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 20V13H15V20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "profile") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClasses} aria-hidden="true">
        <path
          d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 20C5.7 17.67 7.78 16 10.25 16H13.75C16.22 16 18.3 17.67 19 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "map") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClasses} aria-hidden="true">
        <path
          d="M9 5L15 3L20 5V19L15 17L9 19L4 17V5L9 7V19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 3V17"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 7V19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "groups") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClasses} aria-hidden="true">
        <path
          d="M9 12C10.66 12 12 10.66 12 9C12 7.34 10.66 6 9 6C7.34 6 6 7.34 6 9C6 10.66 7.34 12 9 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 20C3.6 17.8 5.5 16.2 7.8 16H10.2C12.5 16.2 14.4 17.8 15 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 6.2C17.46 6.65 18.5 7.96 18.5 9.5C18.5 11.04 17.46 12.35 16 12.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 16.2C19.3 16.7 20.7 18.1 21 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconClasses} aria-hidden="true">
      <path
        d="M5 17C6.6 13.4 10.1 11 14 11C16.5 11 18.8 11.9 20.5 13.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 13.5C7.05 12.12 8.33 11.15 9.8 11.01C10.89 10.9 11.95 11.25 12.74 11.97L14.13 13.24C14.78 13.83 15.64 14.12 16.5 14.03C17.66 13.92 18.68 13.16 19.14 12.09"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 18.5C5 18.5 6.2 19.5 8 19.5C9.8 19.5 11 18.5 11 18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
