/**
 * Data → SVG geometry. Pure; no DOM, no Lit, no Date formatting. The element
 * feeds this a width/height and gets back path strings and positioned
 * labels. Everything is unit-testable in node.
 */

import type { CurvePoint, TideEvent, TideKind } from "./contract";
import { heightAt, sampleCosine } from "./tide";

const HOUR = 3_600_000;
const COSINE_STEP = 10 * 60_000;

export interface ChartInput {
  events: TideEvent[];
  curve: CurvePoint[] | null;
  /** epoch ms */
  now: number;
  hoursBack: number;
  hoursAhead: number;
  width: number;
  height: number;
  /** metres → display unit (identity for metric) */
  toDisplay?: (m: number) => number;
  /** local hour (0–23) of an epoch ms timestamp, for tick alignment */
  hourOf?: (t: number) => number;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Marker {
  x: number;
  y: number;
  type: TideKind;
  time: number;
  /** display units */
  height: number;
  /** true if the label should sit below the dot (lows) */
  below: boolean;
}

export interface XTick {
  x: number;
  time: number;
  /** midnight in the local zone: label with the day, not the hour */
  major: boolean;
}

export interface YTick {
  y: number;
  value: number;
}

export interface ChartModel {
  width: number;
  height: number;
  plot: { x0: number; y0: number; x1: number; y1: number };
  domain: { t0: number; t1: number; h0: number; h1: number };
  /** empty string when there is nothing to draw */
  linePath: string;
  areaPath: string;
  /** the line was cosine-interpolated between events, not provider data */
  approximate: boolean;
  now: { x: number; y: number | null };
  markers: Marker[];
  xTicks: XTick[];
  yTicks: YTick[];
  /** nothing at all could be drawn (no curve, fewer than two events) */
  empty: boolean;
}

export const DEFAULT_PADDING: Padding = { top: 14, right: 10, bottom: 22, left: 36 };

export function makeScale(d0: number, d1: number, r0: number, r1: number): (v: number) => number {
  const span = d1 - d0 || 1;
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

/** A "nice" tick step for roughly `count` ticks over `span`. */
export function niceStep(span: number, count: number): number {
  if (span <= 0 || count <= 0) return 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  return nice * mag;
}

export function yTicks(h0: number, h1: number, count = 3): number[] {
  const step = niceStep(h1 - h0, count);
  const out: number[] = [];
  for (let v = Math.ceil(h0 / step) * step; v <= h1 + 1e-9; v += step) {
    out.push(Number(v.toFixed(6)));
  }
  return out;
}

/** Roughly the pixels a time label needs; below this, ticks thin out. */
const MIN_TICK_PX = 44;

/**
 * Hour-aligned ticks every `every` hours in the local zone (6 or 12, so
 * midnight is always included); midnight is "major". `hourOf` maps a
 * timestamp to its local hour.
 */
export function xTicks(
  t0: number,
  t1: number,
  hourOf: (t: number) => number,
  every: 6 | 12 | 24 = 6,
): number[] {
  const out: number[] = [];
  const first = Math.ceil(t0 / HOUR) * HOUR;
  for (let t = first; t <= t1; t += HOUR) {
    if (hourOf(t) % every === 0) out.push(t);
  }
  return out;
}

/** Widest tick spacing that fits `plotWidth` for the window. */
export function tickSpacing(t0: number, t1: number, plotWidth: number): 6 | 12 | 24 {
  const hours = (t1 - t0) / HOUR;
  for (const every of [6, 12] as const) {
    if ((hours / every) * MIN_TICK_PX <= plotWidth) return every;
  }
  return 24;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Monotone cubic interpolation (Fritsch–Carlson) through the points. Unlike
 * Catmull-Rom it never overshoots, so the curve peaks exactly at a high
 * marker rather than a hair above it.
 */
export function smoothPath(pts: Array<{ x: number; y: number }>): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${r1(pts[0]!.x)},${r1(pts[0]!.y)}`;
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1]!.x - pts[i]!.x);
    dy.push(pts[i + 1]!.y - pts[i]!.y);
    m.push(dx[i]! === 0 ? 0 : dy[i]! / dx[i]!);
  }
  const t: number[] = [m[0]!];
  for (let i = 1; i < n - 1; i++) {
    const a = m[i - 1]!;
    const b = m[i]!;
    t.push(a * b <= 0 ? 0 : (a + b) / 2);
  }
  t.push(m[n - 2]!);
  // Fritsch–Carlson limiter
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i]! / m[i]!;
    const b = t[i + 1]! / m[i]!;
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      t[i] = tau * a * m[i]!;
      t[i + 1] = tau * b * m[i]!;
    }
  }
  let d = `M${r1(pts[0]!.x)},${r1(pts[0]!.y)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i]!;
    const p1 = pts[i + 1]!;
    const h = dx[i]! / 3;
    d += `C${r1(p0.x + h)},${r1(p0.y + t[i]! * h)} ${r1(p1.x - h)},${r1(p1.y - t[i + 1]! * h)} ${r1(p1.x)},${r1(p1.y)}`;
  }
  return d;
}

/**
 * Pick the points to draw. Provider curve if present (with one point either
 * side of the window for continuity — the element clips), else a cosine
 * between events. Returns null when nothing can be drawn.
 */
export function seriesFor(
  events: TideEvent[],
  curve: CurvePoint[] | null,
  t0: number,
  t1: number,
): { points: CurvePoint[]; approximate: boolean } | null {
  if (curve && curve.length >= 2) {
    let lo = curve.findIndex((p) => p.time >= t0);
    if (lo === -1) lo = curve.length;
    let hi = curve.findIndex((p) => p.time > t1);
    if (hi === -1) hi = curve.length;
    lo = Math.max(0, lo - 1);
    hi = Math.min(curve.length, hi + 1);
    const points = curve.slice(lo, hi);
    if (points.length >= 2) return { points, approximate: false };
  }
  const points = sampleCosine(events, t0, t1, COSINE_STEP);
  return points.length >= 2 ? { points, approximate: true } : null;
}

export function buildChart(input: ChartInput, padding: Padding = DEFAULT_PADDING): ChartModel {
  const toDisplay = input.toDisplay ?? ((m) => m);
  const hourOf = input.hourOf ?? ((t) => new Date(t).getUTCHours());
  const { events, curve, now, width, height } = input;

  const plot = {
    x0: padding.left,
    y0: padding.top,
    x1: Math.max(padding.left + 1, width - padding.right),
    y1: Math.max(padding.top + 1, height - padding.bottom),
  };

  // Time window. Don't show empty space before the data starts: the
  // integration currently emits [now, now+48h] only, so the past tail is
  // whatever has accrued since the last state write.
  const wanted0 = now - input.hoursBack * HOUR;
  const t1 = now + input.hoursAhead * HOUR;
  const firstData = Math.min(
    events[0]?.time ?? Infinity,
    curve?.[0]?.time ?? Infinity,
    now,
  );
  const t0 = Math.max(wanted0, firstData);

  const series = seriesFor(events, curve, t0, t1);
  const inWindow = events.filter((e) => e.time >= t0 && e.time <= t1);

  // Height domain from what will be drawn, padded so labels fit.
  const heights: number[] = [];
  if (series) for (const p of series.points) heights.push(p.height);
  for (const e of inWindow) heights.push(e.height);
  let h0 = heights.length ? Math.min(...heights) : 0;
  let h1 = heights.length ? Math.max(...heights) : 1;
  if (h1 - h0 < 0.1) {
    h0 -= 0.5;
    h1 += 0.5;
  }
  const pad = (h1 - h0) * 0.22;
  h0 = toDisplay(h0 - pad);
  h1 = toDisplay(h1 + pad);

  const sx = makeScale(t0, t1, plot.x0, plot.x1);
  const sy = makeScale(h0, h1, plot.y1, plot.y0);

  let linePath = "";
  let areaPath = "";
  if (series) {
    const pts = series.points.map((p) => ({ x: sx(p.time), y: sy(toDisplay(p.height)) }));
    linePath = smoothPath(pts);
    const first = pts[0]!;
    const last = pts[pts.length - 1]!;
    areaPath = `${linePath}L${r1(last.x)},${r1(plot.y1)}L${r1(first.x)},${r1(plot.y1)}Z`;
  }

  const markers: Marker[] = inWindow.map((e) => ({
    x: r1(sx(e.time)),
    y: r1(sy(toDisplay(e.height))),
    type: e.type,
    time: e.time,
    height: toDisplay(e.height),
    below: e.type === "low",
  }));

  const nowH = heightAt(events, curve, now);
  const nowModel = {
    x: r1(sx(now)),
    y: nowH === null ? null : r1(sy(toDisplay(nowH))),
  };

  return {
    width,
    height,
    plot,
    domain: { t0, t1, h0, h1 },
    linePath,
    areaPath,
    approximate: series?.approximate ?? false,
    now: nowModel,
    markers,
    xTicks: xTicks(t0, t1, hourOf, tickSpacing(t0, t1, plot.x1 - plot.x0)).map((time) => ({
      x: r1(sx(time)),
      time,
      major: hourOf(time) === 0,
    })),
    yTicks: yTicks(h0, h1).map((value) => ({ y: r1(sy(value)), value })),
    empty: series === null,
  };
}
