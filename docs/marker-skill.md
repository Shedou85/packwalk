# Custom Mapbox Markers – shapes, SVG, colors

How to create custom-shaped markers (dog, animal, SVG, emoji) in react-map-gl v8 with dynamic colors.

## How markers work

`<Marker>` accepts any React node as `children` — that becomes the visual. No special API needed.

```tsx
<Marker latitude={lat} longitude={lng} anchor="center">
  {/* anything here becomes the marker */}
</Marker>
```

## anchor values

| Value | Use case |
|-------|----------|
| `"center"` | Circular/round markers |
| `"bottom"` | Pin-style markers pointing to location |

## Option 1 — SVG (recommended)

Full control over shape and color. Pass `fill` dynamically.

```tsx
<Marker latitude={walker.latitude} longitude={walker.longitude} anchor="bottom">
  <button onClick={() => setSelectedId(walker.id)}>
    <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none">
      {/* dog head */}
      <circle cx="32" cy="36" r="18" fill={walker.isYou ? "#4DA8DA" : "#2D3748"} />
      {/* left ear */}
      <ellipse cx="18" cy="24" rx="8" ry="12" fill={walker.isYou ? "#4DA8DA" : "#2D3748"} transform="rotate(-20 18 24)" />
      {/* right ear */}
      <ellipse cx="46" cy="24" rx="8" ry="12" fill={walker.isYou ? "#4DA8DA" : "#2D3748"} transform="rotate(20 46 24)" />
    </svg>
  </button>
</Marker>
```

Use `currentColor` + Tailwind `text-*` for color if preferred:
```tsx
<svg className="h-10 w-10 text-blue-500" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="28" fill="currentColor" />
</svg>
```

## Option 2 — Emoji (fastest, no color control)

```tsx
<Marker latitude={lat} longitude={lng} anchor="center">
  <button className="text-3xl leading-none drop-shadow-md">🐕</button>
</Marker>
```

## Option 3 — PNG/WebP image

```tsx
<Marker latitude={lat} longitude={lng} anchor="bottom">
  <button>
    <img src="/markers/dog-blue.png" className="h-10 w-10" alt="" />
  </button>
</Marker>
```
Requires separate files per color variant.

## Performance guide

| Marker count | Approach |
|---|---|
| < 50 | DOM-based (`<Marker>` children) ✓ |
| 50–200 | DOM + `useMemo` on marker array |
| 200+ | Switch to WebGL symbol layers |

Wrap marker array in `useMemo` to prevent re-renders during pan:
```tsx
const markers = useMemo(() =>
  walkers.map(w => <Marker key={w.id} ...>...</Marker>),
  [walkers]
);
```

## Dynamic color per walker

Add a `color` field to the walker data type and pass it to `fill`:
```tsx
type WalkerMarker = {
  ...
  color: string; // e.g. "#4DA8DA"
};

<circle fill={walker.color} />
```
