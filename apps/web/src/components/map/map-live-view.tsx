"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";

import { followWalker, unfollowWalker } from "@/app/map/actions";
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
  isMock?: boolean;
  isFollowed?: boolean;
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

const popupActionClass =
  "inline-flex w-full cursor-pointer items-center justify-center rounded-full px-3 py-2 text-[11px] font-medium transition-[transform,box-shadow,background-color] hover:-translate-y-0.5";

export function MapLiveView({ token, walkers }: MapLiveViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveUserPosition, setLiveUserPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<MapRef>(null);
  const markerClickedRef = useRef(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLiveUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Silently ignore — map still works without live tracking
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Merge live browser position into the "You" marker so it updates in real-time
  // without waiting for a Supabase round-trip and page reload.
  const displayWalkers = useMemo(
    () =>
      liveUserPosition
        ? walkers.map((w) =>
            w.isYou
              ? { ...w, latitude: liveUserPosition.latitude, longitude: liveUserPosition.longitude }
              : w,
          )
        : walkers,
    [walkers, liveUserPosition],
  );

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

  const selectedWalker = displayWalkers.find((walker) => walker.id === selectedId) ?? null;

  const handleMarkerClick = useCallback(
    (event: React.MouseEvent, walkerId: string) => {
      event.stopPropagation();
      markerClickedRef.current = true;
      setSelectedId(walkerId);
    },
    [],
  );

  const handleMapClick = useCallback(() => {
    if (markerClickedRef.current) {
      markerClickedRef.current = false;
      return;
    }

    setSelectedId(null);
  }, []);

  // Keep Mapbox camera uncontrolled during interaction.
  // Reintroducing `viewState` + `onMove` here would put camera movement behind
  // React state updates and can make markers appear detached from the map while
  // panning or zooming. Recenter actions should use `mapRef` methods instead.
  const recenterToUser = () => {
    if (liveUserPosition) {
      mapRef.current?.flyTo({
        center: [liveUserPosition.longitude, liveUserPosition.latitude],
        zoom: 15,
      });
    } else {
      mapRef.current?.flyTo({
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
      });
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick}
      >
        {displayWalkers.map((walker) => (
          <Marker
            key={walker.id}
            latitude={walker.latitude}
            longitude={walker.longitude}
            anchor="center"
          >
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => handleMarkerClick(event, walker.id)}
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
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
            offset={14}
            onClose={() => setSelectedId(null)}
            className="[&_.mapboxgl-popup-content]:max-w-[min(168px,calc(100vw-76px))] [&_.mapboxgl-popup-content]:overflow-hidden [&_.mapboxgl-popup-content]:rounded-[20px] [&_.mapboxgl-popup-content]:border [&_.mapboxgl-popup-content]:border-white/72 [&_.mapboxgl-popup-content]:bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(243,248,255,0.9)_100%)] [&_.mapboxgl-popup-content]:p-0 [&_.mapboxgl-popup-content]:shadow-[0_16px_32px_rgba(35,60,89,0.15)] [&_.mapboxgl-popup-content]:backdrop-blur-xl [&_.mapboxgl-popup-tip]:hidden sm:[&_.mapboxgl-popup-content]:max-w-[208px]"
          >
            <div className="w-[min(168px,calc(100vw-76px))] sm:w-[208px]">
              <div className="relative border-b border-white/62 bg-[linear-gradient(180deg,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0.12)_100%)] px-3 py-2.5 text-center">
                <div className="min-w-0 pr-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                    Live walker
                  </p>
                  <p className="mt-1 truncate text-[14px] font-semibold text-[var(--text-strong)]">
                    {selectedWalker.name}
                    {selectedWalker.isYou ? " · You" : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--text-soft)]">
                    {selectedWalker.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="absolute right-2 top-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white/72 bg-white/72 text-[var(--text-soft)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-white"
                  aria-label="Close walker popup"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 6L14 14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 6L6 14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-2.5 px-2.5 py-2.5 text-center">
                <div className="flex flex-wrap justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-body)]">
                  <span className="rounded-full border border-[rgba(123,167,209,0.2)] bg-white/82 px-2.5 py-1">
                    {selectedWalker.visibility}
                  </span>
                  <span className="rounded-full border border-[rgba(123,167,209,0.2)] bg-white/82 px-2.5 py-1">
                    {selectedWalker.precision}
                  </span>
                  {selectedWalker.isMock ? (
                    <span className="rounded-full border border-[rgba(123,167,209,0.2)] bg-white/82 px-2.5 py-1">
                      test
                    </span>
                  ) : null}
                </div>

                {!selectedWalker.isYou ? (
                  <div className="grid gap-2">
                    {selectedWalker.isMock ? (
                      <Link
                        href={
                          selectedWalker.isFollowed
                            ? "/map?mockWalker=1"
                            : "/map?mockWalker=1&mockFollow=1"
                        }
                        className={cn(
                          popupActionClass,
                          selectedWalker.isFollowed
                            ? "border border-[rgba(123,167,209,0.28)] bg-white/70 text-[var(--text-strong)] hover:bg-white/85"
                            : "bg-[linear-gradient(135deg,#4da8da_0%,#256ea8_100%)] text-white shadow-[0_10px_24px_rgba(77,168,218,0.24)] hover:shadow-[0_12px_24px_rgba(77,168,218,0.3)]",
                        )}
                      >
                        {selectedWalker.isFollowed ? "Following" : "Follow"}
                      </Link>
                    ) : (
                      <form
                        action={selectedWalker.isFollowed ? unfollowWalker : followWalker}
                      >
                        <input
                          type="hidden"
                          name="followingId"
                          value={selectedWalker.id}
                        />
                        <button
                          type="submit"
                          className={cn(
                            popupActionClass,
                            selectedWalker.isFollowed
                              ? "border border-[rgba(123,167,209,0.28)] bg-white/70 text-[var(--text-strong)] hover:bg-white/85"
                              : "bg-[linear-gradient(135deg,#4da8da_0%,#256ea8_100%)] text-white shadow-[0_10px_24px_rgba(77,168,218,0.24)] hover:shadow-[0_12px_24px_rgba(77,168,218,0.3)]",
                          )}
                        >
                          {selectedWalker.isFollowed ? "Following" : "Follow"}
                        </button>
                      </form>
                    )}

                    <Link
                      href={`#walker-${selectedWalker.id}`}
                      onClick={() => setSelectedId(null)}
                      className={cn(
                        popupActionClass,
                        "border border-[rgba(123,167,209,0.28)] bg-white/62 text-[var(--text-strong)] hover:bg-white/80",
                      )}
                    >
                      Open details
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-[16px] border border-dashed border-[rgba(123,167,209,0.28)] bg-white/42 px-3 py-2.5">
                    <p className="text-xs leading-5 text-[var(--text-body)]">
                      This is your live marker.
                    </p>
                  </div>
                )}

                {selectedWalker.isMock ? (
                  <p className="text-[10px] leading-4 text-[var(--text-soft)]">
                    Dev-only test walker.
                  </p>
                ) : null}
              </div>
            </div>
          </Popup>
        ) : null}
      </Map>

      <button
        type="button"
        onClick={recenterToUser}
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

      {!displayWalkers.length ? (
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
