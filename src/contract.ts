/**
 * Mirror of the `sensor.<name>_tide` attribute contract owned by open-tides
 * (open-tides/docs/design.md § Entities). If the card needs something not
 * here, change the integration first.
 *
 * Wire shape:
 *
 *   state: rising | falling
 *   attributes:
 *     datum: LAT
 *     provider: marine_ie
 *     station: Dublin Port
 *     attribution: ...          (HA adds this from _attr_attribution)
 *     licence: CC-BY-4.0
 *     licence_url: https://...
 *     events:                   # next 48 h, ascending
 *       - { time: ISO-8601, height: metres, type: high | low }
 *     curve:                    # optional, next 48 h at 20-min step
 *       - [ISO-8601, metres]
 *
 * There is no version field; the card validates structure instead and
 * reports anything it had to drop via `warnings`.
 *
 * Sibling entities (`sensor.<name>_range`, `_rate`, `_next_spring`,
 * `_next_neap`; open-tides ≥ 0.3.0) are plain sensors read by `extras.ts`;
 * they are not part of this attribute contract.
 */

export type TideKind = "high" | "low";
export type TideState = "rising" | "falling";

export interface TideEvent {
  /** epoch ms, UTC */
  time: number;
  /** metres above the provider's datum */
  height: number;
  type: TideKind;
}

export interface CurvePoint {
  time: number;
  height: number;
}

export interface TideData {
  /** Raw sensor state. Stale between coordinator refreshes; prefer tide.ts. */
  state: TideState | null;
  station: string | null;
  provider: string | null;
  datum: string | null;
  attribution: string | null;
  licence: string | null;
  licenceUrl: string | null;
  /** Ascending. Empty if the attribute is absent or entirely malformed. */
  events: TideEvent[];
  /** Ascending. null if the attribute is absent (curve option off). */
  curve: CurvePoint[] | null;
  /** Structural problems found while parsing; shown as a banner. */
  warnings: string[];
}

/** Minimal shape of a HA state object; avoids depending on HA types. */
export interface HassEntityLike {
  state: string;
  attributes: Record<string, unknown>;
  last_updated?: string;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function parseTime(v: unknown): number | null {
  if (typeof v !== "string") return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : null;
}

function parseHeight(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function parseEvent(row: unknown): TideEvent | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;
  const time = parseTime(r.time);
  const height = parseHeight(r.height);
  const type = r.type === "high" || r.type === "low" ? r.type : null;
  if (time === null || height === null || type === null) return null;
  return { time, height, type };
}

function parsePoint(row: unknown): CurvePoint | null {
  if (!Array.isArray(row) || row.length < 2) return null;
  const time = parseTime(row[0]);
  const height = parseHeight(row[1]);
  if (time === null || height === null) return null;
  return { time, height };
}

export function parseState(s: unknown): TideState | null {
  return s === "rising" || s === "falling" ? s : null;
}

/**
 * Parse a HA state object into TideData. Never throws. Bad rows are dropped
 * and counted; an attribute of entirely the wrong shape is treated as absent.
 */
export function parseTideEntity(entity: HassEntityLike): TideData {
  const a = entity.attributes ?? {};
  const warnings: string[] = [];

  let events: TideEvent[] = [];
  if (a.events !== undefined) {
    if (Array.isArray(a.events)) {
      const parsed = a.events.map(parseEvent);
      events = parsed.filter((e): e is TideEvent => e !== null);
      const dropped = parsed.length - events.length;
      if (dropped > 0) warnings.push(`events: ${dropped} malformed row(s) ignored`);
      events.sort((x, y) => x.time - y.time);
    } else {
      warnings.push("events: expected a list");
    }
  }

  let curve: CurvePoint[] | null = null;
  if (a.curve !== undefined) {
    if (Array.isArray(a.curve)) {
      const parsed = a.curve.map(parsePoint);
      curve = parsed.filter((p): p is CurvePoint => p !== null);
      const dropped = parsed.length - curve.length;
      if (dropped > 0) warnings.push(`curve: ${dropped} malformed point(s) ignored`);
      curve.sort((x, y) => x.time - y.time);
      if (curve.length < 2) curve = null;
    } else {
      warnings.push("curve: expected a list");
    }
  }

  return {
    state: parseState(entity.state),
    station: str(a.station),
    provider: str(a.provider),
    datum: str(a.datum),
    attribution: str(a.attribution),
    licence: str(a.licence),
    licenceUrl: str(a.licence_url),
    events,
    curve,
    warnings,
  };
}
