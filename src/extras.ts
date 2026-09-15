/**
 * Optional stats from the sibling entities open-tides ≥ 0.3.0 creates next
 * to `sensor.<name>_tide`: `range`, `rate`, `next_spring`, `next_neap`.
 * Entity ids are `sensor.<station>_<key>` by contract, so the sibling id
 * is the tide id with its suffix swapped. A sibling that isn't in
 * `hass.states` (older integration, renamed entity) is simply not shown.
 *
 * Values are read, not derived: `rate` and `range` are whatever the
 * integration last wrote (see gerrowadat/open-tides#16 on staleness).
 */

import {
  formatDayTime,
  formatDisplayHeight,
  formatDuration,
  toUnit,
  type HeightUnit,
} from "./format";
import type { ExtraKey, HomeAssistant } from "./ha-types";
import { localize } from "./i18n";

const TIDE_SUFFIX = "_tide";

export interface ExtraStat {
  key: ExtraKey;
  entityId: string;
  label: string;
  value: string;
  /** secondary line, e.g. "in 3d 4h" or "range 4.3 m" */
  sub: string | null;
  /** for rate: sign of the value, to pick an icon */
  trend: "up" | "down" | "flat" | null;
}

/** `sensor.dublin_port_tide` + `range` → `sensor.dublin_port_range`. */
export function siblingEntityId(tideEntityId: string, key: ExtraKey): string | null {
  if (!tideEntityId.endsWith(TIDE_SUFFIX)) return null;
  return tideEntityId.slice(0, -TIDE_SUFFIX.length) + "_" + key;
}

function numeric(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

/**
 * A length state in metres. HA converts `distance` sensors for display if
 * the user picked a unit in entity settings, and then reports that unit in
 * `unit_of_measurement`; undo that so the card's own unit choice applies.
 */
export function metresFrom(state: unknown, unit: unknown): number | null {
  const n = numeric(state);
  if (n === null) return null;
  switch (unit) {
    case "ft":
      return n / 3.280839895;
    case "cm":
      return n / 100;
    case "mm":
      return n / 1000;
    case "in":
      return n * 0.0254;
    default:
      return n; // "m" or unknown: trust it
  }
}

export function readExtra(
  hass: HomeAssistant,
  tideEntityId: string,
  key: ExtraKey,
  now: number,
  unit: HeightUnit,
  lang: string,
): ExtraStat | null {
  const entityId = siblingEntityId(tideEntityId, key);
  if (!entityId) return null;
  const ent = hass.states[entityId];
  if (!ent || ent.state === "unavailable" || ent.state === "unknown") return null;
  const label = localize(hass, `extras.${key}`);
  const height = (m: number, digits = 1) => `${formatDisplayHeight(toUnit(m, unit), lang, digits)} ${unit}`;

  switch (key) {
    case "range": {
      const m = metresFrom(ent.state, ent.attributes.unit_of_measurement);
      if (m === null) return null;
      const max = metresFrom(ent.attributes.horizon_max, "m");
      const min = metresFrom(ent.attributes.horizon_min, "m");
      const sub =
        max !== null && min !== null
          ? localize(hass, "extras.range_span", { min: height(min), max: height(max) })
          : null;
      return { key, entityId, label, value: height(m), sub, trend: null };
    }
    case "rate": {
      // native unit is m/h; HA doesn't convert custom units
      const mph = numeric(ent.state);
      if (mph === null) return null;
      const v = toUnit(Math.abs(mph), unit);
      const trend = mph > 0.005 ? "up" : mph < -0.005 ? "down" : "flat";
      const sign = trend === "up" ? "+" : trend === "down" ? "−" : "";
      return {
        key,
        entityId,
        label,
        value: `${sign}${formatDisplayHeight(v, lang, 2)} ${unit}/h`,
        sub: localize(hass, `extras.rate_${trend}`),
        trend,
      };
    }
    case "next_spring":
    case "next_neap": {
      const t = Date.parse(ent.state);
      if (!Number.isFinite(t)) return null;
      const r = metresFrom(ent.attributes.range, "m");
      const when = formatDayTime(t, now, hass);
      const rel =
        t > now
          ? localize(hass, "in", { duration: formatDuration(t - now) })
          : localize(hass, "ago", { duration: formatDuration(now - t) });
      const sub = r !== null ? `${rel} · ${localize(hass, "extras.range_of", { range: height(r) })}` : rel;
      return { key, entityId, label, value: when, sub, trend: null };
    }
  }
}
