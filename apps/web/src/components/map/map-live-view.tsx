"use client";

import { useMemo, useRef, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";

import { cn } from "@/lib/cn";

type WalkerMarker = {
  id: string;
  name: string;
  city: string;
  visibility: string;
  precision: string;
  latitude: number;
  longitude: number;
  isYou: boolean;
};

type MapLiveViewProps = {
  token: string;
  walkers: WalkerMarker[];
};

const fallbackCenter = {
  latitude: 54.6872,
  longitude: 25.2797,
  zoom: 11,
};

export function MapLiveView({ token, walkers }: MapLiveViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(walkers[0]?.id ?? null);
  const mapRef = useRef<MapRef>(null);

  const initialViewState = useMemo(() => {
    if (!walkers.length) {
      return fallbackCenter;
    }

    const averageLatitude =
      walkers.reduce((sum, walker) => sum + walker.latitude, 0) / walkers.length;
    const averageLongitude =
      walkers.reduce((sum, walker) => sum + walker.longitude, 0) / walkers.length;

    return {
      latitude: averageLatitude,
      longitude: averageLongitude,
      zoom: walkers.length > 1 ? 12 : 13.5,
    };
  }, [walkers]);

  const selectedWalker =
    walkers.find((walker) => walker.id === selectedId) ?? walkers[0] ?? null;

  // Keep Mapbox camera uncontrolled during interaction.
  // Reintroducing `viewState` + `onMove` here would put camera movement behind
  // React state updates and can make markers appear detached from the map while
  // panning or zooming. Recenter actions should use `mapRef` methods instead.
  const recenterToWalkers = () => {
    mapRef.current?.flyTo({
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
    });
  };

  return (
    <div className="relative h-[360px] w-full overflow-hidden sm:h-[420px]">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        {walkers.map((walker) => (
          <Marker
            key={walker.id}
            latitude={walker.latitude}
            longitude={walker.longitude}
            anchor="center"
          >
            <button
              type="button"
              onClick={() => setSelectedId(walker.id)}
              className={cn(
                "relative flex h-16 w-16 cursor-pointer items-center justify-center bg-transparent",
                selectedId === walker.id ? "scale-105" : "",
              )}
              aria-label={`Open ${walker.name} marker`}
            >
              <span
                className={cn(
                  "pointer-events-none absolute bottom-[calc(100%-4px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] shadow-[0_12px_24px_rgba(38,64,93,0.22)] backdrop-blur-md transition-[transform,box-shadow]",
                  walker.isYou
                    ? "border-[rgba(37,110,168,0.35)] bg-[linear-gradient(135deg,rgba(77,168,218,0.92)_0%,rgba(37,110,168,0.88)_100%)] text-white"
                    : "border-white/70 bg-white/82 text-[var(--text-strong)]",
                )}
              >
                {walker.isYou ? "You" : "Walker"}
              </span>
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-4 shadow-[0_8px_16px_rgba(38,64,93,0.18)]",
                  walker.isYou
                    ? "border-white bg-[var(--accent-strong)]"
                    : "border-white bg-[var(--text-strong)]",
                )}
              />
            </button>
          </Marker>
        ))}

        {selectedWalker ? (
          <Popup
            latitude={selectedWalker.latitude}
            longitude={selectedWalker.longitude}
            anchor="top"
            closeButton={false}
            offset={18}
            onClose={() => setSelectedId(null)}
            className="[&_.mapboxgl-popup-content]:rounded-[22px] [&_.mapboxgl-popup-content]:border [&_.mapboxgl-popup-content]:border-white/70 [&_.mapboxgl-popup-content]:bg-white/88 [&_.mapboxgl-popup-content]:p-0 [&_.mapboxgl-popup-content]:shadow-[0_20px_40px_rgba(35,60,89,0.18)] [&_.mapboxgl-popup-tip]:hidden"
          >
            <div className="min-w-[180px] p-4">
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {selectedWalker.name}
                {selectedWalker.isYou ? " · You" : ""}
              </p>
              <p className="mt-1 text-xs text-[var(--text-soft)]">
                {selectedWalker.city}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-body)]">
                <span className="rounded-full border border-[rgba(123,167,209,0.22)] bg-white/78 px-2.5 py-1">
                  {selectedWalker.visibility}
                </span>
                <span className="rounded-full border border-[rgba(123,167,209,0.22)] bg-white/78 px-2.5 py-1">
                  {selectedWalker.precision}
                </span>
              </div>
            </div>
          </Popup>
        ) : null}
      </Map>

      <button
        type="button"
        onClick={recenterToWalkers}
        className="absolute right-4 top-4 z-10 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/72 bg-white/88 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-strong)] shadow-[0_14px_28px_rgba(35,60,89,0.16)] backdrop-blur-md transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-white"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4 text-[var(--accent-strong)]"
          aria-hidden="true"
        >
          <path
            d="M10 3V6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 14V17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M3 10H6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14 10H17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle
            cx="10"
            cy="10"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        Center
      </button>

      {!walkers.length ? (
        <div className="absolute inset-x-4 bottom-4 rounded-[24px] border border-white/70 bg-white/72 p-4 shadow-[0_20px_44px_rgba(44,72,102,0.14)] backdrop-blur-xl">
          <p className="text-sm font-semibold text-[var(--text-strong)]">
            Waiting for live walkers
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            Once someone is live and sharing visible coordinates, markers will
            appear here automatically.
          </p>
        </div>
      ) : null}
    </div>
  );
}
