/**
 * Pure derivations from events and curve, computed against the browser's
 * clock. Mirrors open-tides `tide.py` so the card agrees with the sensors,
 * but doesn't depend on the sensor having been re-written recently: the
 * integration only writes state on coordinator refresh, so `state` and
 * `next_*` can be hours stale. Nothing here predicts tides; it only reads
 * the list the integration gave us.
 */

import type { CurvePoint, TideEvent, TideKind, TideState } from "./contract";

/** (last event at or before now, first event after now). */
export function bracket(
  events: TideEvent[],
  now: number,
): [TideEvent | null, TideEvent | null] {
  let prev: TideEvent | null = null;
  let next: TideEvent | null = null;
  for (const e of events) {
    if (e.time <= now) prev = e;
    else {
      next = e;
      break;
    }
  }
  return [prev, next];
}

export function stateAt(events: TideEvent[], now: number): TideState | null {
  const [, next] = bracket(events, now);
  if (!next) return null;
  return next.type === "high" ? "rising" : "falling";
}

export function nextOf(events: TideEvent[], kind: TideKind, now: number): TideEvent | null {
  return events.find((e) => e.time > now && e.type === kind) ?? null;
}

export function nextEvent(events: TideEvent[], now: number): TideEvent | null {
  return events.find((e) => e.time > now) ?? null;
}

/** Height at t assuming a cosine between adjacent high/low events. */
export function cosineBetween(a: TideEvent, b: TideEvent, t: number): number {
  const span = b.time - a.time;
  if (span <= 0) return a.height;
  const frac = (t - a.time) / span;
  const mid = (a.height + b.height) / 2;
  const amp = (a.height - b.height) / 2;
  return mid + amp * Math.cos(Math.PI * frac);
}

/** Linear interpolation on the curve; null if t is outside it. */
export function interpolateCurve(curve: CurvePoint[], t: number): number | null {
  if (curve.length < 2) return null;
  const first = curve[0]!;
  const last = curve[curve.length - 1]!;
  if (t < first.time || t > last.time) return null;
  // binary search for first index with time >= t
  let lo = 0;
  let hi = curve.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (curve[mid]!.time < t) lo = mid + 1;
    else hi = mid;
  }
  const b = curve[lo]!;
  if (b.time === t || lo === 0) return b.height;
  const a = curve[lo - 1]!;
  const frac = (t - a.time) / (b.time - a.time);
  return a.height + (b.height - a.height) * frac;
}

/** Curve if it covers t, else cosine between bracketing events, else null. */
export function heightAt(
  events: TideEvent[],
  curve: CurvePoint[] | null,
  t: number,
): number | null {
  if (curve) {
    const h = interpolateCurve(curve, t);
    if (h !== null) return h;
  }
  const [prev, next] = bracket(events, t);
  if (!prev || !next) return null;
  return cosineBetween(prev, next, t);
}

/**
 * Sample a cosine interpolation between consecutive events at `step` ms.
 * Only spans between two known events are produced; nothing is extrapolated
 * before the first or after the last event.
 */
export function sampleCosine(
  events: TideEvent[],
  from: number,
  to: number,
  step: number,
): CurvePoint[] {
  const out: CurvePoint[] = [];
  if (events.length < 2 || step <= 0) return out;
  const start = Math.max(from, events[0]!.time);
  const end = Math.min(to, events[events.length - 1]!.time);
  if (end < start) return out;
  let i = 0;
  for (let t = start; t <= end; t += step) {
    while (i < events.length - 2 && events[i + 1]!.time < t) i++;
    const a = events[i]!;
    const b = events[i + 1]!;
    out.push({ time: t, height: cosineBetween(a, b, t) });
  }
  if (out.length && out[out.length - 1]!.time !== end) {
    const [a, b] = bracket(events, end);
    if (a && b) out.push({ time: end, height: cosineBetween(a, b, end) });
    else out.push({ time: end, height: events[events.length - 1]!.height });
  }
  return out;
}
