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
The card declares which contract version it supports; on mismatch it warns
in the card rather than silently mis-rendering.

## Rendering

Three stacked regions, all optional via config:

1. **Header** — station name, state (rising/falling with an arrow), and the
   next event as "High 4.1 m in 2h 14m". Compact enough to be the whole card
   on a narrow layout.
2. **Curve** — SVG. X axis: time from `now - lookback` to `now + horizon`.
   Y axis: height. A vertical "now" line. High/low events as dots with
   height labels. If `curve` is absent, draw a smooth cosine interpolation
   between events instead (labelled as approximate in a tooltip, not as a
   visual lie).
3. **Events list** — the next N highs and lows as rows, time in the user's
   locale and unit system.

Geometry is pure functions in `chart.ts` (data → SVG path strings) so it is
unit-testable without a DOM.

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

The visual editor exposes all of these. `getStubConfig` picks the first
`sensor.*_tide` entity it finds so the card picker shows a live preview.

## Theming

Uses `--primary-color`, `--secondary-text-color`, `--card-background-color`,
`--divider-color`, and `--ha-card-border-radius`. Optional overrides via
`--open-tides-curve-color`, `--open-tides-high-color`,
`--open-tides-low-color` so users can restyle in a theme without forking.

## Behaviour

- Re-renders on `hass` change only if the entity's `last_updated` changed.
- Computes "in 2h 14m" on a 60-second timer; the curve itself doesn't need
  a timer since the data is static between coordinator refreshes.
- All times are converted from UTC to `hass.locale` time zone on display.
- Attribution rendered small in the footer, always, from the sensor's
  `attribution` attribute.

## Error states

| Condition                    | Card shows                                |
|------------------------------|-------------------------------------------|
| entity not set               | "Set an entity" config error              |
| entity not found             | "Entity not found: …"                     |
| entity has no `events`       | header only, note "No forecast available" |
| contract version mismatch    | header + warning banner                   |

## Testing

- `vitest` on `chart.ts` (scales, path generation, event placement) and on
  `contract.ts` parsing with fixture attributes, including a fixture with
  `curve` absent.
- A manual `demo/` dashboard config for eyeballing against a local HA.

## Out of scope for v1

- Tide-dependent scoring (fishing, surfing, sailing). TideWise does that;
  no need to duplicate.
- Multi-station in one card.
- Observed vs predicted overlay — worth doing, but only once the
  integration's `observed_height` sensor is stable.
