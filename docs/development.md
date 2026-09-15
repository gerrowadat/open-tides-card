# Development

TypeScript, Lit 3, Vite, vitest. No chart library, no HA helper package.

```
npm ci
npm test            # vitest, node environment, no DOM needed
npm run build       # tsc --noEmit && vite build → dist/open-tides-card.js
npm run dev         # vite dev server on :5173
```

Without Node on the host, the same commands run in a container:

```
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app node:22 npm ci
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app node:22 npm test
```

## Layout

```
src/
  open-tides-card.ts   the element: lifecycle, render, styles, registration
  editor.ts            visual editor (ha-form + selector schema)
  chart.ts             pure geometry: data → paths, markers, ticks
  tide.ts              pure derivations: state, next event, interpolation
  contract.ts          attribute shape and a never-throwing parser
  format.ts            Intl wrappers driven by hass.locale / hass.config
  ha-types.ts          the slice of `hass` we touch; config defaults/clamps
  i18n/                en.json + localize()
tests/                 one file per module above, plus fixtures.ts
demo/index.html        standalone preview with stubbed HA elements
```

`chart.ts` and `tide.ts` import nothing from Lit or the DOM. Keep it that
way; that's what makes them testable in node.

## Preview without Home Assistant

`npm run dev`, then open <http://localhost:5173/demo/>. The page stubs
`ha-card`, `ha-icon` and `ha-alert`, builds fixture data relative to the
current time, and renders ten configurations: full, no curve, imperial /
12-hour, header only, curve only, stale, malformed, empty, missing entity,
no entity. A button toggles a dark palette. Add `?built=1` to load
`dist/open-tides-card.js` instead of the source.

The stubs carry their own shadow-DOM styles (the card renders them inside
its shadow root, where document CSS can't reach) and `ha-icon` draws the
real MDI paths for the five icons the card uses. They're stand-ins, but
the card has been checked against a live HA install and they match well
enough to catch layout regressions; still confirm anything that touches
icons or alerts in real HA.

The README screenshots (`docs/images/card-*.png`) are the "with extras"
demo card captured at 440 px wide, 2× scale, light and dark. Regenerate
them after any visual change, or replace them with a capture from a real
dashboard.

## Preview in Home Assistant

1. `npm run dev` — Vite listens on all interfaces, port 5173, CORS on.
2. In HA: Settings → Dashboards → ⋮ → Resources → add
   `http://<this-machine>:5173/src/open-tides-card.ts` as a JavaScript
   module.
3. Add the card. Edits hot-reload.

Remove the resource afterwards; a dashboard pointing at a dev server that
isn't running logs errors on every load.

## Adding a translation

Copy `src/i18n/en.json` to `<lang>.json`, translate, and register it in
`src/i18n/index.ts`. `localize()` matches the HA UI language, then its
primary subtag, then falls back to English key by key.

## Conventions

- Conventional commits.
- No `localStorage`, no `fetch`, no websocket calls. `hass.states` only.
- Every colour is a CSS variable with an HA theme variable as fallback.
- If the card wants a field the sensor doesn't have, change
  [open-tides](https://github.com/gerrowadat/open-tides) first.
