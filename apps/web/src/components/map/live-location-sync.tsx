"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { createClient } from "@/lib/supabase/browser";

type LiveLocationSyncProps = {
  walkId: string | null;
  userId: string;
};

type SyncState = "idle" | "syncing" | "ready" | "error" | "unsupported";

const MIN_SYNC_INTERVAL_MS = 15000;

export function LiveLocationSync({ walkId, userId }: LiveLocationSyncProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const geolocationSupported = isClient ? "geolocation" in navigator : null;
  const [state, setState] = useState<SyncState>("idle");
  const [message, setMessage] = useState(
    "Open this screen outdoors to start sharing live location updates.",
  );
  const lastSyncAtRef = useRef(0);

  useEffect(() => {
    if (!walkId) {
      return;
    }

    if (geolocationSupported !== true) {
      return;
    }

    const supabase = createClient();

    const syncLocation = async (position: GeolocationPosition) => {
      const now = Date.now();

      if (now - lastSyncAtRef.current < MIN_SYNC_INTERVAL_MS) {
        return;
      }

      lastSyncAtRef.current = now;
      setState("syncing");
      setMessage("Updating your live walk position...");

      const { latitude, longitude, accuracy } = position.coords;

      const [{ error: pingError }, { error: walkError }] = await Promise.all([
        supabase.from("location_pings").insert({
          walk_session_id: walkId,
          user_id: userId,
          latitude,
          longitude,
          accuracy_meters: accuracy,
        }),
        supabase
          .from("walk_sessions")
          .update({
            last_latitude: latitude,
            last_longitude: longitude,
            last_accuracy_meters: accuracy,
          })
          .eq("id", walkId)
          .eq("user_id", userId)
          .eq("status", "active"),
      ]);

      if (pingError || walkError) {
        setState("error");
        setMessage((pingError ?? walkError)?.message ?? "Location sync failed.");
        return;
      }

      setState("ready");
      setMessage("Location synced. Nearby discovery is ready for the next refresh.");
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        void syncLocation(position);
      },
      (error) => {
        setState("error");
        setMessage(error.message || "Location permission was denied.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [geolocationSupported, userId, walkId]);

  const derivedState = geolocationSupported === null
    ? "idle"
    : !walkId
    ? "unsupported"
    : !geolocationSupported
      ? "unsupported"
      : state;

  const derivedMessage = geolocationSupported === null
    ? "Checking location access..."
    : !walkId
    ? "Start a walk to begin location syncing."
    : !geolocationSupported
      ? "This browser does not support geolocation."
      : message;

  return (
    <div className="rounded-[24px] border border-white/70 bg-white/64 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--text-strong)]">
          Live location sync
        </p>
        <span className="rounded-full border border-[rgba(123,167,209,0.26)] bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-body)]">
          {derivedState}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">
        {derivedMessage}
      </p>
    </div>
  );
}
