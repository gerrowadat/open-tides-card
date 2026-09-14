# Open Tides Card

Lovelace card for the [open_tides](https://github.com/gerrowadat/open-tides)
Home Assistant integration. One entity in: rising or falling, next high and
low, a height curve for the next day or two, and the list of upcoming tides.

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=gerrowadat&repository=open-tides-card&category=plugin)

Status: alpha, tracking open-tides 0.2. Not yet exercised on a live install.

## Install

HACS → custom repository `gerrowadat/open-tides-card`, category
**Dashboard**, then install. HACS registers the resource. If you install by
hand, copy `open-tides-card.js` from a release into `www/` and add
`/local/open-tides-card.js` as a JavaScript module resource.

Needs the open_tides integration; the card reads `sensor.<station>_tide`
and nothing else. It makes no network requests.

## Configure

Pick "Open Tides Card" in the card picker; it finds your tide sensor and
shows a preview. Everything has a default; the only required key is
`entity`.

```yaml
type: custom:open-tides-card
entity: sensor.dublin_port_tide
```

All options:

```yaml
type: custom:open-tides-card
entity: sensor.dublin_port_tide
name: Clontarf          # header title; default is the station name
hours_ahead: 36         # 1–48 (the sensor carries 48 h)
hours_back: 6           # 0–48; see "What you see" below
show_header: true       # station, rising/falling, next event
show_curve: true        # the graph
show_events: true       # the list of upcoming highs and lows
events_count: 4         # 1–12 rows in that list
height_unit: auto       # auto | m | ft — auto follows your HA unit system
```

Time format and time zone follow your HA profile settings.

## What you see

- **Header**: station, an arrow with *Rising* / *Falling*, and the next
  event — "High 4.1 m in 2h 14m · 19:06".
- **Curve**: predicted height, a dotted "now" line, dots with heights at
  each high and low. If the integration's *Height curve* option is off
  (or the station can't supply one) the line is a cosine drawn between the
  highs and lows instead and is **dashed** to say so; hover it for the
  note. Close enough to glance at, not to plan a launch by.
- **Upcoming**: kind, time, how long until, height.
- **Footer**: the provider's attribution (linked to the licence) and the
  datum. Heights are relative to that datum and aren't comparable across
  providers.

The sensor only carries a forecast from the moment it was last written, so
on a fresh update there is nothing to the left of the "now" line and
`hours_back` has no effect. The tail fills in as the write ages. The
integration currently writes only on its refresh schedule (see
[gerrowadat/open-tides#16](https://github.com/gerrowadat/open-tides/issues/16)),
so the card works out rising/falling and the next event itself from the
`events` list rather than trusting the sensor's state; once the forecast
is entirely in the past it says so instead of guessing.

## Theming

All colours come from your theme. To restyle without forking, set any of
these in a theme:

```yaml
open-tides-curve-color: "#0288d1"   # line and fill; default --primary-color
open-tides-high-color: "#0288d1"    # high markers and labels; default --primary-color
open-tides-low-color: "#78909c"     # low markers and labels; default --secondary-text-color
open-tides-now-color: "#000"        # the now line; default --primary-text-color
```

## Errors

| You see | Because |
|---|---|
| *Set an entity* | no `entity` in the config |
| *Entity not found* | typo, or the integration isn't loaded |
| *… is unavailable* | the integration reported the sensor unavailable |
| *No forecast available* | the sensor has no `events` attribute |
| *Forecast last updated …* | every event is in the past; the integration hasn't rewritten state |
| *events: N malformed row(s) ignored* | the attribute shape didn't match what the card expects; good rows are still drawn |

## Docs

- [Design](docs/design.md) — what the card consumes, how it renders, why
- [Development](docs/development.md) — build, test, preview without HA
- [Releasing](docs/releasing.md)
- [Changelog](CHANGELOG.md)

## Licence

MIT. Tide data is under each provider's licence; the card shows the
attribution the integration supplies.
