import { describe, expect, it } from "vitest";

import {
  DEFAULT_PADDING,
  buildChart,
  makeScale,
  niceStep,
  seriesFor,
  smoothPath,
  tickSpacing,
  xTicks,
  yTicks,
} from "../src/chart";
import { parseTideEntity } from "../src/contract";
import { ENTITY, ENTITY_NO_CURVE, NOW } from "./fixtures";

const H = 3_600_000;
const utcHour = (t: number) => new Date(t).getUTCHours();
const full = parseTideEntity(ENTITY);
const noCurve = parseTideEntity(ENTITY_NO_CURVE);

const base = {
  now: NOW,
  hoursBack: 6,
  hoursAhead: 36,
  width: 400,
  height: 150,
  hourOf: utcHour,
};

describe("scales and ticks", () => {
  it("makeScale maps domain to range linearly", () => {
    const s = makeScale(0, 10, 100, 200);
    expect(s(0)).toBe(100);
    expect(s(5)).toBe(150);
    expect(s(10)).toBe(200);
    expect(makeScale(3, 3, 0, 1)(3)).toBe(0); // degenerate domain doesn't NaN
  });

  it("niceStep picks 1/2/5 multiples", () => {
    expect(niceStep(4, 3)).toBe(1);
    expect(niceStep(10, 3)).toBe(2);
    expect(niceStep(20, 3)).toBe(5);
    expect(niceStep(0.9, 3)).toBe(0.2);
    expect(niceStep(0, 3)).toBe(1);
  });

  it("yTicks land on nice values within the domain", () => {
    expect(yTicks(0.3, 4.5)).toEqual([1, 2, 3, 4]);
    expect(yTicks(-0.5, 0.9)).toEqual([-0.5, 0, 0.5]);
    expect(yTicks(0, 0.7)).toEqual([0, 0.2, 0.4, 0.6]);
  });

  it("xTicks are every 6 h aligned to local hours", () => {
    const t0 = Date.parse("2026-09-14T07:30:00Z");
    const t1 = Date.parse("2026-09-15T13:00:00Z");
    const ticks = xTicks(t0, t1, utcHour);
    expect(ticks.map((t) => new Date(t).toISOString())).toEqual([
      "2026-09-14T12:00:00.000Z",
      "2026-09-14T18:00:00.000Z",
      "2026-09-15T00:00:00.000Z",
      "2026-09-15T06:00:00.000Z",
      "2026-09-15T12:00:00.000Z",
    ]);
  });

  it("xTicks honour a shifted local zone", () => {
    // Pretend local = UTC+1: local midnight is 23:00Z
    const plusOne = (t: number) => (new Date(t).getUTCHours() + 1) % 24;
    const t0 = Date.parse("2026-09-14T20:00:00Z");
    const t1 = Date.parse("2026-09-15T02:00:00Z");
    expect(xTicks(t0, t1, plusOne).map((t) => new Date(t).toISOString())).toEqual([
      "2026-09-14T23:00:00.000Z",
    ]);
  });
});

describe("smoothPath", () => {
  it("handles degenerate inputs", () => {
    expect(smoothPath([])).toBe("");
    expect(smoothPath([{ x: 1, y: 2 }])).toBe("M1,2");
  });

  it("emits one cubic per segment and starts at the first point", () => {
    const d = smoothPath([
      { x: 0, y: 10 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ]);
    expect(d.startsWith("M0,10")).toBe(true);
    expect(d.match(/C/g)).toHaveLength(2);
    expect(d.endsWith("20,10")).toBe(true);
  });

  it("is flat-tangent at a local extremum (no overshoot)", () => {
    // Peak at the middle point: the control points either side of it must be
    // level with it, so the curve never rises above y=0.
    const d = smoothPath([
      { x: 0, y: 10 },
      { x: 10, y: 0 },
      { x: 20, y: 10 },
    ]);
    // second control point of segment 1 and first of segment 2 have y=0
    expect(d).toContain(" 6.7,0 10,0");
    expect(d).toContain("C13.3,0 ");
  });
});

describe("seriesFor", () => {
  it("uses the provider curve with one point of margin either side", () => {
    const t0 = full.curve![10]!.time;
    const t1 = full.curve![20]!.time;
    const s = seriesFor(full.events, full.curve, t0, t1)!;
    expect(s.approximate).toBe(false);
    expect(s.points[0]!.time).toBe(full.curve![9]!.time);
    expect(s.points[s.points.length - 1]!.time).toBe(full.curve![21]!.time);
  });

  it("falls back to cosine when there is no curve", () => {
    const s = seriesFor(noCurve.events, null, NOW, NOW + 36 * H)!;
    expect(s.approximate).toBe(true);
    expect(s.points.length).toBeGreaterThan(50);
  });

  it("falls back to cosine when the curve doesn't reach the window", () => {
    const shortCurve = full.curve!.slice(0, 4); // first hour only
    const s = seriesFor(full.events, shortCurve, NOW + 20 * H, NOW + 30 * H)!;
    expect(s.approximate).toBe(true);
  });

  it("null with nothing to draw", () => {
    expect(seriesFor([full.events[0]!], null, NOW, NOW + H)).toBeNull();
    expect(seriesFor([], null, NOW, NOW + H)).toBeNull();
  });
});

describe("buildChart", () => {
  it("lays out the plot inside the padding", () => {
    const m = buildChart({ ...base, events: full.events, curve: full.curve });
    expect(m.plot).toEqual({
      x0: DEFAULT_PADDING.left,
      y0: DEFAULT_PADDING.top,
      x1: 400 - DEFAULT_PADDING.right,
      y1: 150 - DEFAULT_PADDING.bottom,
    });
    expect(m.empty).toBe(false);
    expect(m.approximate).toBe(false);
    expect(m.linePath.startsWith("M")).toBe(true);
    expect(m.areaPath.endsWith("Z")).toBe(true);
  });

  it("clamps the window start to the first data point", () => {
    // fixture data starts at NOW, so hours_back yields nothing extra
    const m = buildChart({ ...base, events: full.events, curve: full.curve });
    expect(m.domain.t0).toBe(NOW);
    expect(m.domain.t1).toBe(NOW + 36 * H);
    expect(m.now.x).toBe(DEFAULT_PADDING.left); // now sits on the left edge
  });

  it("shows the past tail when data predates now", () => {
    const later = NOW + 4 * H;
    const m = buildChart({ ...base, now: later, events: full.events, curve: full.curve });
    expect(m.domain.t0).toBe(NOW); // only 4h back available, not 6
    expect(m.now.x).toBeGreaterThan(DEFAULT_PADDING.left);
    expect(m.now.y).not.toBeNull();
  });

  it("places every in-window event as a marker inside the plot", () => {
    const m = buildChart({ ...base, events: full.events, curve: full.curve });
    const inWindow = full.events.filter((e) => e.time <= NOW + 36 * H);
    expect(m.markers).toHaveLength(inWindow.length);
    for (const k of m.markers) {
      expect(k.x).toBeGreaterThanOrEqual(m.plot.x0);
      expect(k.x).toBeLessThanOrEqual(m.plot.x1);
      expect(k.y).toBeGreaterThanOrEqual(m.plot.y0);
      expect(k.y).toBeLessThanOrEqual(m.plot.y1);
    }
    const highs = m.markers.filter((k) => k.type === "high");
    const lows = m.markers.filter((k) => k.type === "low");
    expect(Math.max(...highs.map((k) => k.y))).toBeLessThan(Math.min(...lows.map((k) => k.y)));
    expect(highs.every((k) => !k.below)).toBe(true);
    expect(lows.every((k) => k.below)).toBe(true);
  });

  it("marks the cosine fallback as approximate", () => {
    const m = buildChart({ ...base, events: noCurve.events, curve: null });
    expect(m.approximate).toBe(true);
    expect(m.empty).toBe(false);
  });

  it("converts heights for display", () => {
    const m = buildChart({ ...base, events: full.events, curve: full.curve });
    const ft = buildChart({
      ...base,
      events: full.events,
      curve: full.curve,
      toDisplay: (x) => x * 3.280839895,
    });
    expect(ft.markers[0]!.height).toBeCloseTo(m.markers[0]!.height * 3.280839895);
    expect(ft.domain.h1).toBeCloseTo(m.domain.h1 * 3.280839895);
    // same pixel position: the scale is in display units on both sides
    expect(ft.markers[0]!.y).toBeCloseTo(m.markers[0]!.y, 0);
  });

  it("is empty with a single event and no curve", () => {
    const m = buildChart({ ...base, events: [full.events[0]!], curve: null });
    expect(m.empty).toBe(true);
    expect(m.linePath).toBe("");
    expect(m.markers).toHaveLength(1);
  });

  it("y domain stays sane on flat data", () => {
    const flat = [
      { time: NOW + H, height: 2, type: "high" as const },
      { time: NOW + 7 * H, height: 2, type: "low" as const },
    ];
    const m = buildChart({ ...base, events: flat, curve: null });
    expect(m.domain.h1 - m.domain.h0).toBeGreaterThan(0.5);
    expect(m.yTicks.length).toBeGreaterThan(0);
  });

  it("survives a tiny box", () => {
    const m = buildChart({ ...base, width: 10, height: 10, events: full.events, curve: full.curve });
    expect(m.plot.x1).toBeGreaterThan(m.plot.x0);
    expect(m.plot.y1).toBeGreaterThan(m.plot.y0);
    expect(m.linePath).not.toContain("NaN");
  });
});

describe("tickSpacing", () => {
  const H = 3_600_000;
  it("thins ticks when the plot is narrow", () => {
    expect(tickSpacing(0, 36 * H, 400)).toBe(6); // 6 ticks × 44px
    expect(tickSpacing(0, 48 * H, 300)).toBe(12); // 8 × 44 = 352 > 300
    expect(tickSpacing(0, 48 * H, 100)).toBe(24);
  });
  it("12 h ticks still include midnight", () => {
    const utcHour = (t: number) => new Date(t).getUTCHours();
    const t0 = Date.parse("2026-09-14T07:30:00Z");
    const t1 = Date.parse("2026-09-15T13:00:00Z");
    expect(xTicks(t0, t1, utcHour, 12).map((t) => new Date(t).toISOString())).toEqual([
      "2026-09-14T12:00:00.000Z",
      "2026-09-15T00:00:00.000Z",
      "2026-09-15T12:00:00.000Z",
    ]);
  });
});
