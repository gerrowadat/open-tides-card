# open-tides-card

Lovelace custom card for Home Assistant that renders tide data from the
`open_tides` integration: a height curve with high/low markers, current
state, and next high/low. Read `DESIGN.md` before changing what the card
consumes or how it's configured.

## What this is

- A single-file JS bundle, `dist/open-tides-card.js`, distributed via HACS
  as a **plugin** (dashboard) repository. Separate repo because HACS can't
  serve an integration and a plugin from one repo.
- Consumes `sensor.<name>_tide` from the `open_tides` integration. It has
  no network access and never calls an external API. State only.

## Repo layout

```
src/
  open-tides-card.ts       card element (Lit)
  editor.ts                visual config editor (ha-form schema)
  chart.ts                 SVG geometry, pure (no chart library, no DOM)
  tide.ts                  state / next event / interpolation, pure
  contract.ts              TS types mirroring open_tides attribute shape + parser
  format.ts                Intl wrappers driven by hass.locale / hass.config
  ha-types.ts              slice of `hass` used; config defaults and clamps
  i18n/                    en.json + others
dist/open-tides-card.js    build output; gitignored, attached to releases by CI
tests/                     vitest unit tests for parsing, derivations, geometry, formatting
demo/index.html            standalone preview with stubbed HA elements
hacs.json                  { "name": "Open Tides Card", "render_readme": true, "filename": "open-tides-card.js" }
```

## Non-negotiables

1. **The attribute contract is owned by `open-tides`, not here.** `contract.ts`
   mirrors the `events` / `curve` / `datum` shape documented in
   `open-tides/DESIGN.md`. If the card needs a field the integration doesn't
   emit, change the integration first, then the card.
2. **Degrade, don't crash.** Missing `curve` → draw events only. Missing
   `events` → show state only. Unknown entity → show a config error card, not
   a blank.
3. **No external chart library.** Hand-rolled SVG keeps the bundle small
   and avoids a dependency that fights HA theming.
4. **Respect HA theme variables** for every colour. No hard-coded hex.
5. **Filename is fixed.** HACS requires `dist/open-tides-card.js` to match
   the repo name. Don't rename.

## Conventions

- TypeScript, Lit 3, Vite for the build, `vitest` for tests.
- `npm run build` → `dist/`. `npm run dev` serves with HMR against a local HA.
- No `localStorage`, no fetch. All data via `hass.states`.
- Visual editor required (`getConfigElement`) plus `getStubConfig` so it
  appears in the card picker.
- Time formatting via `hass.locale`; units via `hass.config.unit_system`.
- Conventional commits. Tag releases `vX.Y.Z`; the release must contain
  `dist/open-tides-card.js` as an asset.

## Commands

```
npm ci
npm run dev
npm test
npm run build
```

No Node on the dev host: prefix with
`docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app node:22`.
See docs/development.md.

## Things to avoid

- Don't compute tides. If a value isn't in the sensor attributes, the card
  doesn't have it.
- Don't fetch history via the HA websocket to backfill the curve; the
  integration exposes what's needed.
- Don't add provider-specific branches. The card must not know or care
  whether the data came from Ireland, NOAA or Norway.
