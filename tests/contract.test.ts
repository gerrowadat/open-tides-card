import { describe, expect, it } from "vitest";

import { parseTideEntity } from "../src/contract";
import { ATTRS, ENTITY, ENTITY_NO_CURVE, EVENT_ROWS } from "./fixtures";

describe("parseTideEntity", () => {
  it("parses the full contract", () => {
    const d = parseTideEntity(ENTITY);
    expect(d.state).toBe("rising");
    expect(d.station).toBe("Dublin Port");
    expect(d.provider).toBe("marine_ie");
    expect(d.datum).toBe("LAT");
    expect(d.attribution).toContain("Marine Institute");
    expect(d.licence).toBe("CC-BY-4.0");
    expect(d.licenceUrl).toMatch(/^https:/);
    expect(d.events).toHaveLength(8);
    expect(d.events[0]).toEqual({
      time: Date.parse(EVENT_ROWS[0]!.time),
      height: 4.1,
      type: "high",
    });
    expect(d.curve).not.toBeNull();
    expect(d.curve!.length).toBeGreaterThan(100);
    expect(d.warnings).toEqual([]);
  });

  it("curve absent → null, no warning", () => {
    const d = parseTideEntity(ENTITY_NO_CURVE);
    expect(d.curve).toBeNull();
    expect(d.events).toHaveLength(8);
    expect(d.warnings).toEqual([]);
  });

  it("events absent → empty list, no warning", () => {
    const d = parseTideEntity({ state: "rising", attributes: { station: "X" } });
    expect(d.events).toEqual([]);
    expect(d.curve).toBeNull();
    expect(d.warnings).toEqual([]);
  });

  it("drops malformed rows and reports them", () => {
    const d = parseTideEntity({
      state: "rising",
      attributes: {
        ...ATTRS,
        events: [
          ...EVENT_ROWS.slice(0, 2),
          { time: "not a date", height: 1, type: "high" },
          { time: EVENT_ROWS[2]!.time, height: "nan", type: "low" },
          { time: EVENT_ROWS[3]!.time, height: 1, type: "slack" },
          null,
          42,
        ],
        curve: [["2026-09-14T12:00:00+00:00", 1.0], ["bad", 1], [1, 2], "x", ["2026-09-14T12:20:00+00:00", 1.1]],
      },
    });
    expect(d.events).toHaveLength(2);
    expect(d.curve).toHaveLength(2);
    expect(d.warnings).toEqual([
      "events: 5 malformed row(s) ignored",
      "curve: 3 malformed point(s) ignored",
    ]);
  });

  it("wrong attribute types are treated as absent with a warning", () => {
    const d = parseTideEntity({
      state: "falling",
      attributes: { events: "nope", curve: { a: 1 } },
    });
    expect(d.events).toEqual([]);
    expect(d.curve).toBeNull();
    expect(d.warnings).toEqual(["events: expected a list", "curve: expected a list"]);
  });

  it("sorts events and curve ascending", () => {
    const d = parseTideEntity({
      state: "rising",
      attributes: {
        events: [...EVENT_ROWS].reverse(),
        curve: [...ATTRS.curve].reverse(),
      },
    });
    for (let i = 1; i < d.events.length; i++) {
      expect(d.events[i]!.time).toBeGreaterThan(d.events[i - 1]!.time);
    }
    for (let i = 1; i < d.curve!.length; i++) {
      expect(d.curve![i]!.time).toBeGreaterThan(d.curve![i - 1]!.time);
    }
  });

  it("a one-point curve is useless and becomes null", () => {
    const d = parseTideEntity({
      state: "rising",
      attributes: { curve: [["2026-09-14T12:00:00+00:00", 1.0]] },
    });
    expect(d.curve).toBeNull();
  });

  it("unknown state → null", () => {
    expect(parseTideEntity({ state: "unknown", attributes: {} }).state).toBeNull();
    expect(parseTideEntity({ state: "unavailable", attributes: {} }).state).toBeNull();
  });

  it("accepts numeric strings for height", () => {
    const d = parseTideEntity({
      state: "rising",
      attributes: { events: [{ time: EVENT_ROWS[0]!.time, height: "3.5", type: "high" }] },
    });
    expect(d.events[0]!.height).toBe(3.5);
  });
});
