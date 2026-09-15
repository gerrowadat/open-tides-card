/**
 * The slice of the Home Assistant frontend `hass` object this card touches.
 * Kept local rather than pulling in custom-card-helpers, which lags HA.
 */

import type { HassEntityLike } from "./contract";

export interface HassLocale {
  language: string;
  number_format?: string;
  /** "language" | "system" | "12" | "24" */
  time_format?: string;
  /** "language" | "system" | "server" — where "server" means hass.config.time_zone */
  time_zone?: string;
  date_format?: string;
}

export interface HassConfig {
  time_zone: string;
  unit_system: { length: string; [k: string]: string };
}

export interface HomeAssistant {
  states: Record<string, HassEntityLike>;
  locale: HassLocale;
  config: HassConfig;
  language?: string;
}

/**
 * Sibling entities of `sensor.<name>_tide` (open-tides ≥ 0.3.0) that the
 * card can show as small stats. Keys are the integration's entity keys.
 */
export const EXTRA_KEYS = ["range", "rate", "next_spring", "next_neap"] as const;
export type ExtraKey = (typeof EXTRA_KEYS)[number];

export interface OpenTidesCardConfig {
  type: string;
  entity?: string;
  extras?: ExtraKey[];
  name?: string;
  hours_ahead?: number;
  hours_back?: number;
  show_header?: boolean;
  show_curve?: boolean;
  show_events?: boolean;
  events_count?: number;
  height_unit?: "auto" | "m" | "ft";
}

export interface ResolvedConfig {
  entity: string;
  extras: ExtraKey[];
  name: string | null;
  hours_ahead: number;
  hours_back: number;
  show_header: boolean;
  show_curve: boolean;
  show_events: boolean;
  events_count: number;
  height_unit: "auto" | "m" | "ft";
}

export const MAX_HOURS = 48;

const clampInt = (v: unknown, lo: number, hi: number, dflt: number): number => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return dflt;
  return Math.min(hi, Math.max(lo, Math.round(n)));
};

/** Apply defaults and clamp. `entity` may be empty; the card reports that. */
export function resolveConfig(c: OpenTidesCardConfig): ResolvedConfig {
  const extras = Array.isArray(c.extras)
    ? EXTRA_KEYS.filter((k) => (c.extras as unknown[]).includes(k))
    : [];
  return {
    entity: typeof c.entity === "string" ? c.entity : "",
    extras,
    name: typeof c.name === "string" && c.name ? c.name : null,
    hours_ahead: clampInt(c.hours_ahead, 1, MAX_HOURS, 36),
    hours_back: clampInt(c.hours_back, 0, MAX_HOURS, 6),
    show_header: c.show_header ?? true,
    show_curve: c.show_curve ?? true,
    show_events: c.show_events ?? true,
    events_count: clampInt(c.events_count, 1, 12, 4),
    height_unit: c.height_unit === "m" || c.height_unit === "ft" ? c.height_unit : "auto",
  };
}
