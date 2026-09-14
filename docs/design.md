# open-tides-card — design

## Goal

A card that makes the `open_tides` sensor legible at a glance: is the tide
rising or falling, when is the next high and low, and what does the next
day or two look like. One entity in, one card out. No configuration beyond
the entity should be required for a good default.

## Relationship to open-tides

The integration owns the data contract. This card consumes the attributes
on `sensor.<name>_tide`:

```yaml
state: rising | falling
attributes:
  datum: LAT
  provider: marine_ie
  station: Dublin Port
  attribution: ...
  events:                      # next 48 h of highs/lows
    - time: ISO-8601 UTC
      height: metres
      type: high | low
  curve:                       # optional, next 48 h, 20-min step
    - [ISO-8601 UTC, metres]
```

`contract.ts` is the single place this shape is expressed in TypeScript.
There is no version field in the contract, so the card validates
*structure* instead: rows that don't parse are dropped and counted, an
attribute of entirely the wrong shape is treated as absent, and either
case surfaces as a warning banner on the card rather than a blank or a
wrong curve. `parseTideEntity()` never throws.

`attribution` is not in `extra_state_attributes` in the integration; HA
adds it to the state from `_attr_attribution`, so it arrives the same way.

### What the integration does *not* do (as of open-tides 0.2.0)

- **State is only written on coordinator refresh** — every 7 days for the
  Marine Institute, 1 day for NOAA/Kartverket. `state`, `next_*` and the
  `[now, now+48h]` windows on `events`/`curve` are computed at write time
  and go stale within hours. Tracked as gerrowadat/open-tides#16. The card therefore **derives
  rising/falling and the next event itself** from `events` against the
  browser clock (`tide.ts`, a port of the integration's `tide.py`), and
  never trusts `state` on its own. That isn't computing tides; it's reading
  the list we were given.
- **No past data.** Both windows start at write-time "now", so there is
  nothing to draw before the "now" line on a fresh write; the past tail
  grows as the write ages. The chart clamps its left edge to the first data
  point rather than showing empty space. When the integration gains a
  lookback, `hours_back` starts working with no card change.

## Rendering

Three stacked regions, all optional via config:

1. **Header** — station name, state (rising/falling with an arrow), and the
   next event as "High 4.1 m in 2h 14m". Compact enough to be the whole card
   on a narrow layout.
2. **Curve** — SVG. X axis: time from `max(now - hours_back, first data
   point)` to `now + hours_ahead`. Y axis: height. A vertical dotted "now"
   line with a dot at the current height (from the curve, else cosine
   between the bracketing events). High/low events as dots with height
   labels above highs and below lows. If `curve` is absent or doesn't cover
   the window, draw a cosine interpolation between events instead, as a
   **dashed** line with a tooltip saying it is interpolated — approximate
   should look approximate. The line is monotone-cubic smoothed
   (Fritsch–Carlson) so it never overshoots a marker.

   Ticks: every 6 h aligned to local hours, with midnight labelled by
   weekday instead of time; thins to 12 h / 24 h when the plot is too
   narrow for the labels. Y ticks on 1/2/5 steps. Width comes from a
   `ResizeObserver`; height is fixed at 150 px.
3. **Events list** — the next N highs and lows as rows: kind, time (with
   weekday if not today), "in 2h 14m", height. Locale and unit from `hass`.

Then a footer with the provider's `attribution` (linked to `licence_url`
when present — CC BY requires the link) and the datum.

Geometry is pure functions in `chart.ts` (data → SVG path strings and
label positions) so it is unit-testable without a DOM. `chart.ts` takes
`toDisplay` (unit conversion) and `hourOf` (local hour of a timestamp) as
callbacks so it never touches `Intl` itself.

## Configuration

```yaml
type: custom:open-tides-card
entity: sensor.dublin_port_tide
name: Clontarf              # optional override
hours_ahead: 36             # default 36, max 48 (that's all the sensor has)
hours_back: 6               # default 6
show_header: true
show_curve: true
show_events: true
events_count: 4
height_unit: auto           # auto | m | ft — auto follows hass.config
```

Out-of-range values are clamped, not rejected. The visual editor is an
`ha-form` with a selector schema (entity picker filtered to
`integration: open_tides`), and only writes keys that differ from the
defaults so the YAML stays short. `getStubConfig` picks the first
`sensor.*_tide` entity whose attributes carry `events`, so the card picker
shows a live preview. `getGridOptions` estimates rows from which regions
are enabled.

## Theming

Uses `--primary-color`, `--secondary-text-color`, `--card-background-color`,
`--divider-color`, and `--ha-card-border-radius`. Optional overrides via
`--open-tides-curve-color`, `--open-tides-high-color`,
`--open-tides-low-color` so users can restyle in a theme without forking.

## Behaviour

- Re-renders on `hass` change only if the entity's state object identity
  changed (HA state objects are immutable, so this is equivalent to
  `last_updated` changing and cheaper) or the locale changed.
- A 60-second timer, aligned to the wall-clock minute, advances `now`.
  That re-derives state, "in 2h 14m", the now line, and the events list.
  The curve path only changes if the window moves, which it does by one
  minute — cheap.
- Times are formatted with `Intl` using `hass.locale.language` and
  `time_format`; zone is `hass.config.time_zone` when `hass.locale.time_zone`
  is `server`, else the browser's.
- Heights are metres on the wire; feet when `height_unit: ft` or when
  `auto` and `hass.config.unit_system.length === "mi"`.
- Attribution rendered small in the footer, always.

## Error states

| Condition                    | Card shows                                |
|------------------------------|-------------------------------------------|
| entity not set               | "Set an entity" config error              |
| entity not found             | "Entity not found: …"                     |
| entity `unavailable`         | "… is unavailable" warning                |
| entity has no `events`       | header only, note "No forecast available" |
| all events in the past       | "Forecast last updated 2d 12h" warning, state "Unknown", empty list note |
| malformed rows               | warning banner per attribute, valid rows still drawn |
| fewer than 2 events, no curve| no chart (nothing to interpolate)         |

## Testing

- `vitest` on `chart.ts` (scales, ticks, smoothing, series selection,
  layout), `tide.ts` (bracketing, interpolation, sampling), `contract.ts`
  (parsing, including a fixture with `curve` absent and malformed rows)
  and `format.ts` (units, locale, durations).
- `demo/index.html` renders ten configurations against fixture data with
  stubbed `ha-card`/`ha-icon`/`ha-alert`, for eyeballing outside HA (light
  and dark). `npm run dev` then open `/demo/`. See `docs/development.md`.

## Out of scope for v1

- Tide-dependent scoring (fishing, surfing, sailing). TideWise does that;
  no need to duplicate.
- Multi-station in one card.
- Observed vs predicted overlay — worth doing, but only once the
  integration's `observed_height` sensor is stable.
