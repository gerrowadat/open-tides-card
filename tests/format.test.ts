import { describe, expect, it } from "vitest";

import {
  formatDayTime,
  formatDuration,
  formatHeight,
  formatTime,
  heightUnit,
  localHourOf,
  timeZone,
  toUnit,
} from "../src/format";
import { resolveConfig } from "../src/ha-types";
import type { HomeAssistant } from "../src/ha-types";
import { localize } from "../src/i18n";
import { NOW } from "./fixtures";

const hass = (over: Partial<HomeAssistant["locale"]> = {}, length = "km"): HomeAssistant => ({
  states: {},
  locale: { language: "en-GB", time_format: "24", time_zone: "server", ...over },
  config: { time_zone: "Europe/Dublin", unit_system: { length } },
});

describe("resolveConfig", () => {
  it("applies defaults", () => {
    expect(resolveConfig({ type: "x" })).toEqual({
      entity: "",
      extras: [],
      name: null,
      hours_ahead: 36,
      hours_back: 6,
      show_header: true,
      show_curve: true,
      show_events: true,
      events_count: 4,
      height_unit: "auto",
    });
  });
  it("clamps and coerces", () => {
    const c = resolveConfig({
      type: "x",
      entity: "sensor.a_tide",
      hours_ahead: 500,
      hours_back: -3,
      events_count: "7" as unknown as number,
      height_unit: "furlongs" as unknown as "m",
      show_curve: false,
    });
    expect(c.hours_ahead).toBe(48);
    expect(c.hours_back).toBe(0);
    expect(c.events_count).toBe(7);
    expect(c.height_unit).toBe("auto");
    expect(c.show_curve).toBe(false);
  });
});

describe("units", () => {
  it("follows hass unit system by default", () => {
    const auto = resolveConfig({ type: "x" });
    expect(heightUnit(auto, hass({}, "km"))).toBe("m");
    expect(heightUnit(auto, hass({}, "mi"))).toBe("ft");
    expect(heightUnit(resolveConfig({ type: "x", height_unit: "ft" }), hass({}, "km"))).toBe("ft");
    expect(heightUnit(auto, undefined)).toBe("m");
  });
  it("converts and formats", () => {
    expect(toUnit(1, "ft")).toBeCloseTo(3.2808);
    expect(formatHeight(4.123, "m", "en-GB")).toBe("4.1 m");
    expect(formatHeight(1, "ft", "en-US", 2)).toBe("3.28 ft");
    expect(formatHeight(1234.5, "m", "de-DE")).toBe("1.234,5 m");
  });
});

describe("time", () => {
  it("server zone is used when locale says so", () => {
    expect(timeZone(hass())).toBe("Europe/Dublin");
    expect(timeZone(hass({ time_zone: "local" }))).toBeUndefined();
  });
  it("formats in 24h in the server zone", () => {
    // 12:00Z is 13:00 IST in September
    expect(formatTime(NOW, hass())).toBe("13:00");
  });
  it("formats in 12h when asked", () => {
    expect(formatTime(NOW, hass({ time_format: "12", language: "en-US" }))).toMatch(/1:00\s?PM/i);
  });
  it("prefixes the weekday for other days", () => {
    expect(formatDayTime(NOW, NOW, hass())).toBe("13:00");
    expect(formatDayTime(NOW + 24 * 3_600_000, NOW, hass())).toBe("Tue 13:00");
  });
  it("localHourOf reports the local hour", () => {
    const hourOf = localHourOf(hass());
    expect(hourOf(NOW)).toBe(13);
    expect(hourOf(Date.parse("2026-09-14T23:00:00Z"))).toBe(0);
  });
  it("formatDuration", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(45 * 60_000)).toBe("45m");
    expect(formatDuration(2 * 3_600_000 + 14 * 60_000)).toBe("2h 14m");
    expect(formatDuration(-(2 * 3_600_000 + 14 * 60_000))).toBe("2h 14m");
    expect(formatDuration(27 * 3_600_000)).toBe("1d 3h");
  });
});

describe("localize", () => {
  it("substitutes and falls back to english", () => {
    expect(localize(hass(), "in", { duration: "2h" })).toBe("in 2h");
    expect(localize(hass({ language: "xx-YY" }), "high")).toBe("High");
    expect(localize(hass(), "nope.missing")).toBe("nope.missing");
    expect(localize(undefined, "errors.not_found", { entity: "sensor.x" })).toBe(
      "Entity not found: sensor.x",
    );
  });
});
