import { describe, expect, it } from "vitest";

import { parseTideEntity } from "../src/contract";
import {
  bracket,
  cosineBetween,
  heightAt,
  interpolateCurve,
  nextEvent,
  nextOf,
  sampleCosine,
  stateAt,
} from "../src/tide";
import { ENTITY, NOW } from "./fixtures";

const H = 3_600_000;
const data = parseTideEntity(ENTITY);
const ev = data.events;

describe("bracket / stateAt / next*", () => {
  it("before the first event: no prev, first is next", () => {
    const [prev, next] = bracket(ev, NOW);
    expect(prev).toBeNull();
    expect(next).toBe(ev[0]);
  });

  it("an event exactly at now counts as previous", () => {
    const [prev, next] = bracket(ev, ev[0]!.time);
    expect(prev).toBe(ev[0]);
    expect(next).toBe(ev[1]);
  });

  it("after the last event: no next", () => {
    const [prev, next] = bracket(ev, ev[7]!.time + 1);
    expect(prev).toBe(ev[7]);
    expect(next).toBeNull();
  });

  it("stateAt follows the next event's kind", () => {
    expect(stateAt(ev, NOW)).toBe("rising"); // next is a high
    expect(stateAt(ev, ev[0]!.time + H)).toBe("falling");
    expect(stateAt(ev, ev[7]!.time + 1)).toBeNull();
  });

  it("nextOf / nextEvent skip past events", () => {
    const t = ev[0]!.time + H;
    expect(nextOf(ev, "high", t)).toBe(ev[2]);
    expect(nextOf(ev, "low", t)).toBe(ev[1]);
    expect(nextEvent(ev, t)).toBe(ev[1]);
    expect(nextOf(ev, "high", ev[7]!.time)).toBeNull();
  });
});

describe("cosineBetween", () => {
  const a = { time: 0, height: 4, type: "high" as const };
  const b = { time: 6 * H, height: 0, type: "low" as const };
  it("hits the endpoints and the midpoint", () => {
    expect(cosineBetween(a, b, 0)).toBeCloseTo(4);
    expect(cosineBetween(a, b, 6 * H)).toBeCloseTo(0);
    expect(cosineBetween(a, b, 3 * H)).toBeCloseTo(2);
  });
  it("zero span returns a.height", () => {
    expect(cosineBetween(a, { ...b, time: 0 }, 0)).toBe(4);
  });
});

describe("interpolateCurve", () => {
  const curve = data.curve!;
  it("returns exact values at points", () => {
    expect(interpolateCurve(curve, curve[3]!.time)).toBe(curve[3]!.height);
    expect(interpolateCurve(curve, curve[0]!.time)).toBe(curve[0]!.height);
  });
  it("interpolates linearly between points", () => {
    const a = curve[5]!;
    const b = curve[6]!;
    const mid = (a.time + b.time) / 2;
    expect(interpolateCurve(curve, mid)).toBeCloseTo((a.height + b.height) / 2, 6);
  });
  it("null outside the curve", () => {
    expect(interpolateCurve(curve, curve[0]!.time - 1)).toBeNull();
    expect(interpolateCurve(curve, curve[curve.length - 1]!.time + 1)).toBeNull();
    expect(interpolateCurve([curve[0]!], curve[0]!.time)).toBeNull();
  });
});

describe("heightAt", () => {
  it("prefers the curve when it covers t", () => {
    const t = data.curve![10]!.time;
    expect(heightAt(ev, data.curve, t)).toBe(data.curve![10]!.height);
  });
  it("falls back to cosine between events", () => {
    const t = ev[0]!.time + (ev[1]!.time - ev[0]!.time) / 2;
    const expected = cosineBetween(ev[0]!, ev[1]!, t);
    expect(heightAt(ev, null, t)).toBeCloseTo(expected);
    // and when the curve doesn't reach that far
    expect(heightAt(ev, data.curve!.slice(0, 3), t)).toBeCloseTo(expected);
  });
  it("null with no bracketing events", () => {
    expect(heightAt(ev, null, NOW)).toBeNull();
    expect(heightAt([], null, NOW)).toBeNull();
  });
});

describe("sampleCosine", () => {
  it("samples only between known events, ending at the last one", () => {
    const pts = sampleCosine(ev, NOW - 6 * H, NOW + 48 * H, 10 * 60_000);
    expect(pts[0]!.time).toBe(ev[0]!.time);
    expect(pts[pts.length - 1]!.time).toBe(ev[7]!.time);
    expect(pts[0]!.height).toBeCloseTo(ev[0]!.height);
    expect(pts[pts.length - 1]!.height).toBeCloseTo(ev[7]!.height);
    for (let i = 1; i < pts.length; i++) expect(pts[i]!.time).toBeGreaterThan(pts[i - 1]!.time);
  });
  it("respects a window inside the events", () => {
    const from = ev[1]!.time;
    const to = ev[3]!.time;
    const pts = sampleCosine(ev, from, to, 10 * 60_000);
    expect(pts[0]!.time).toBe(from);
    expect(pts[pts.length - 1]!.time).toBe(to);
    // passes through the high in between
    const max = Math.max(...pts.map((p) => p.height));
    expect(max).toBeCloseTo(ev[2]!.height, 1);
  });
  it("empty with fewer than two events or a disjoint window", () => {
    expect(sampleCosine([ev[0]!], NOW, NOW + H, 60_000)).toEqual([]);
    expect(sampleCosine(ev, NOW - 10 * H, NOW - 5 * H, 60_000)).toEqual([]);
  });
});
