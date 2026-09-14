/**
 * Locale and unit handling via hass.locale / hass.config. No hard-coded
 * formats: Intl does the work, HA's settings choose the options.
 */

import type { HomeAssistant, ResolvedConfig } from "./ha-types";

export type HeightUnit = "m" | "ft";
const FT_PER_M = 3.280839895;

export function heightUnit(config: ResolvedConfig, hass: HomeAssistant | undefined): HeightUnit {
  if (config.height_unit !== "auto") return config.height_unit;
  return hass?.config?.unit_system?.length === "mi" ? "ft" : "m";
}

export function toUnit(metres: number, unit: HeightUnit): number {
  return unit === "ft" ? metres * FT_PER_M : metres;
}

export function formatHeight(metres: number, unit: HeightUnit, locale: string, digits = 1): string {
  const v = toUnit(metres, unit);
  const n = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);
  return `${n} ${unit}`;
}

/** Height already in display units (chart labels). */
export function formatDisplayHeight(v: number, locale: string, digits = 1): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);
}

/** BCP-47 tag Intl should use. `system` in HA means "the browser's". */
export function language(hass: HomeAssistant | undefined): string {
  const l = hass?.locale?.language ?? hass?.language;
  return l && l !== "system" ? l : navigator.language;
}

/** IANA zone for display; undefined lets Intl use the browser's. */
export function timeZone(hass: HomeAssistant | undefined): string | undefined {
  return hass?.locale?.time_zone === "server" ? hass?.config?.time_zone : undefined;
}

function hour12(hass: HomeAssistant | undefined): boolean | undefined {
  const f = hass?.locale?.time_format;
  if (f === "12") return true;
  if (f === "24") return false;
  return undefined; // "language" / "system": let Intl decide
}

export function formatTime(t: number, hass: HomeAssistant | undefined): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone(hass),
  };
  const h12 = hour12(hass);
  if (h12 !== undefined) opts.hour12 = h12;
  return new Intl.DateTimeFormat(language(hass), opts).format(t);
}

export function formatWeekday(t: number, hass: HomeAssistant | undefined): string {
  return new Intl.DateTimeFormat(language(hass), {
    weekday: "short",
    timeZone: timeZone(hass),
  }).format(t);
}

/** "Tue 14:12" if not today, else "14:12". */
export function formatDayTime(t: number, now: number, hass: HomeAssistant | undefined): string {
  const time = formatTime(t, hass);
  return sameLocalDay(t, now, hass) ? time : `${formatWeekday(t, hass)} ${time}`;
}

export function sameLocalDay(a: number, b: number, hass: HomeAssistant | undefined): boolean {
  const f = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timeZone(hass),
  });
  return f.format(a) === f.format(b);
}

/** Local hour of a timestamp in the display zone; for tick alignment. */
export function localHourOf(hass: HomeAssistant | undefined): (t: number) => number {
  const f = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    hour12: false,
    timeZone: timeZone(hass),
  });
  return (t: number) => {
    const h = parseInt(f.format(t), 10);
    return h === 24 ? 0 : h; // some engines print "24" for midnight
  };
}

/** Whole-minute duration, e.g. "2h 14m", "45m", "1d 3h". Sign handled by caller. */
export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.round(Math.abs(ms) / 60_000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
