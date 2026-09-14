/**
 * Fixture shaped like `sensor.dublin_port_tide` at 2026-09-14T12:00Z. Eight
 * events over 48 h, 6 h 12 min apart, and a 20-min-step curve built from a
 * cosine between them (which is what a provider curve looks like at this
 * resolution).
 */
import type { HassEntityLike } from "../src/contract";

export const NOW = Date.parse("2026-09-14T12:00:00+00:00");
const H = 3_600_000;
const M = 60_000;

const first = Date.parse("2026-09-14T16:12:00+00:00"); // first high after NOW
const spacing = 6 * H + 12 * M;

export const EVENT_ROWS = Array.from({ length: 8 }, (_, i) => {
  const high = i % 2 === 0;
  return {
    time: new Date(first + i * spacing).toISOString(),
    height: high ? 4.1 - (i % 4) * 0.05 : 0.6 + (i % 4) * 0.05,
    type: high ? "high" : "low",
  };
});

function cosineRows(): Array<[string, number]> {
  const out: Array<[string, number]> = [];
  const ev = EVENT_ROWS.map((e) => ({ t: Date.parse(e.time), h: e.height }));
  const start = NOW;
  const end = NOW + 48 * H;
  for (let t = start; t <= end; t += 20 * M) {
    let i = 0;
    while (i < ev.length - 2 && ev[i + 1]!.t < t) i++;
    let a = ev[i]!;
    let b = ev[i + 1]!;
    if (t < a.t) {
      // before first event: pretend a low one period earlier
      b = a;
      a = { t: a.t - spacing, h: 0.6 };
    }
    const frac = (t - a.t) / (b.t - a.t);
    const mid = (a.h + b.h) / 2;
    const amp = (a.h - b.h) / 2;
    out.push([new Date(t).toISOString(), Number((mid + amp * Math.cos(Math.PI * frac)).toFixed(3))]);
  }
  return out;
}

export const CURVE_ROWS = cosineRows();

export const ATTRS = {
  datum: "LAT",
  provider: "marine_ie",
  station: "Dublin Port",
  attribution: "Tide predictions © Marine Institute, Ireland",
  licence: "CC-BY-4.0",
  licence_url: "https://creativecommons.org/licenses/by/4.0/",
  events: EVENT_ROWS,
  curve: CURVE_ROWS,
};

export const ENTITY: HassEntityLike = {
  state: "rising",
  attributes: ATTRS,
  last_updated: new Date(NOW).toISOString(),
};

export const ENTITY_NO_CURVE: HassEntityLike = {
  state: "rising",
  attributes: { ...ATTRS, curve: undefined },
  last_updated: new Date(NOW).toISOString(),
};
