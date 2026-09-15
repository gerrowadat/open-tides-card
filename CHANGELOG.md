# Changelog

## 0.2.0 — 2026-09-15

Tracks open-tides 0.3.0.

- `extras` option: show `range`, `rate`, `next_spring`, `next_neap` from
  the sibling sensors open-tides 0.3.0 adds. Opt-in, multi-select in the
  editor; silently absent on older integrations.
- Event rows no longer wrap long 12-hour times at narrow widths.

## 0.1.0 — 2026-09-14

Tracks open-tides 0.2.0.

- Initial card: header (station, rising/falling, next event), SVG curve
  (provider curve, or a dashed cosine between highs and lows when the
  integration's curve option is off), upcoming events list, attribution
  footer with licence link.
- Visual editor; card picker preview via `getStubConfig`.
- Follows HA locale (language, 12/24 h, time zone) and unit system (m/ft).
- Derives rising/falling and next event from `events` client-side, since
  the integration only writes state on refresh (gerrowadat/open-tides#16).
- Degrades on missing or malformed attributes with a banner rather than a
  blank card.
