import { describe, expect, it } from "vitest";

import { metresFrom, readExtra, siblingEntityId } from "../src/extras";
import { resolveConfig, type HomeAssistant } from "../src/ha-types";
import { NOW } from "./fixtures";

const H = 3_600_000;
const iso = (t: number) => new Date(t).toISOString();

function hass(states: HomeAssistant["states"], length = "km"): HomeAssistant {
  return {
    states,
    locale: { language: "en-GB", time_format: "24", time_zone: "server" },
    config: { time_zone: "Europe/Dublin", unit_system: { length } },
  };
}

const TIDE = "sensor.dublin_port_tide";
const full = hass({
  "sensor.dublin_port_range": {
    state: "3.45",
    attributes: { unit_of_measurement: "m", horizon_max: 4.21, horizon_min: 1.87 },
  },
  "sensor.dublin_port_rate": { state: "0.612", attributes: { unit_of_measurement: "m/h" } },
  "sensor.dublin_port_next_spring": {
    state: iso(NOW + 3 * 24 * H + 4 * H),
    attributes: { range: 4.21, height: 4.4 },
  },
  "sensor.dublin_port_next_neap": {
    state: iso(NOW + 10 * 24 * H),
    attributes: { range: 1.87, height: 3.1 },
  },
});

describe("resolveConfig extras", () => {
  it("defaults to none and keeps only known keys, in canonical order", () => {
    expect(resolveConfig({ type: "x" }).extras).toEqual([]);
    expect(
      resolveConfig({ type: "x", extras: ["rate", "bogus", "range", "rate"] as never }).extras,
    ).toEqual(["range", "rate"]);
    expect(resolveConfig({ type: "x", extras: "range" as never }).extras).toEqual([]);
  });
});

describe("siblingEntityId", () => {
  it("swaps the suffix", () => {
    expect(siblingEntityId(TIDE, "range")).toBe("sensor.dublin_port_range");
    expect(siblingEntityId(TIDE, "next_spring")).toBe("sensor.dublin_port_next_spring");
  });
  it("null when the tide entity isn't named by contract", () => {
    expect(siblingEntityId("sensor.something_else", "range")).toBeNull();
  });
});

describe("metresFrom", () => {
  it("undoes HA display conversion", () => {
    expect(metresFrom("3.5", "m")).toBe(3.5);
    expect(metresFrom(3.280839895, "ft")).toBeCloseTo(1);
    expect(metresFrom("150", "cm")).toBe(1.5);
    expect(metresFrom("x", "m")).toBeNull();
    expect(metresFrom(2, undefined)).toBe(2);
  });
});

describe("readExtra", () => {
  it("range: value plus horizon span", () => {
    const x = readExtra(full, TIDE, "range", NOW, "m", "en-GB")!;
    expect(x.label).toBe("Range");
    expect(x.value).toBe("3.5 m");
    expect(x.sub).toBe("1.9 m – 4.2 m ahead");
    expect(x.entityId).toBe("sensor.dublin_port_range");
  });

  it("range in feet", () => {
    const x = readExtra(full, TIDE, "range", NOW, "ft", "en-US")!;
    expect(x.value).toBe("11.3 ft");
  });

  it("range: respects a user display unit on the entity", () => {
    const h = hass({
      "sensor.dublin_port_range": { state: "11.32", attributes: { unit_of_measurement: "ft" } },
    });
    expect(readExtra(h, TIDE, "range", NOW, "m", "en-GB")!.value).toBe("3.5 m");
  });

  it("rate: sign, trend and unit per hour", () => {
    const up = readExtra(full, TIDE, "rate", NOW, "m", "en-GB")!;
    expect(up.value).toBe("+0.61 m/h");
    expect(up.trend).toBe("up");
    expect(up.sub).toBe("rising");
    const h = hass({ "sensor.dublin_port_rate": { state: "-0.3", attributes: {} } });
    const down = readExtra(h, TIDE, "rate", NOW, "ft", "en-GB")!;
    expect(down.value).toBe("−0.98 ft/h");
    expect(down.trend).toBe("down");
    const flat = readExtra(
      hass({ "sensor.dublin_port_rate": { state: "0.001", attributes: {} } }),
      TIDE, "rate", NOW, "m", "en-GB",
    )!;
    expect(flat.trend).toBe("flat");
    expect(flat.value).toBe("0.00 m/h");
    expect(flat.sub).toBe("at the turn");
  });

  it("spring/neap: time, countdown and range", () => {
    const s = readExtra(full, TIDE, "next_spring", NOW, "m", "en-GB")!;
    expect(s.label).toBe("Next spring");
    expect(s.value).toBe("Thu 17:00"); // 2026-09-17T16:00Z in IST
    expect(s.sub).toBe("in 3d 4h · range 4.2 m");
    const n = readExtra(full, TIDE, "next_neap", NOW, "m", "en-GB")!;
    expect(n.value).toBe("Thu 13:00");
    expect(n.sub).toBe("in 10d 0h · range 1.9 m");
  });

  it("spring in the past says ago", () => {
    const h = hass({ "sensor.dublin_port_next_spring": { state: iso(NOW - 2 * H), attributes: {} } });
    expect(readExtra(h, TIDE, "next_spring", NOW, "m", "en-GB")!.sub).toBe("2h 0m ago");
  });

  it("missing, unavailable or garbage siblings are skipped", () => {
    expect(readExtra(hass({}), TIDE, "range", NOW, "m", "en-GB")).toBeNull();
    expect(
      readExtra(hass({ "sensor.dublin_port_range": { state: "unavailable", attributes: {} } }), TIDE, "range", NOW, "m", "en-GB"),
    ).toBeNull();
    expect(
      readExtra(hass({ "sensor.dublin_port_range": { state: "unknown", attributes: {} } }), TIDE, "range", NOW, "m", "en-GB"),
    ).toBeNull();
    expect(
      readExtra(hass({ "sensor.dublin_port_next_neap": { state: "soon", attributes: {} } }), TIDE, "next_neap", NOW, "m", "en-GB"),
    ).toBeNull();
    expect(readExtra(full, "sensor.other", "range", NOW, "m", "en-GB")).toBeNull();
  });
});
