/**
 * open-tides-card: a Lovelace card for `sensor.<name>_tide` from the
 * open_tides integration. Header (state + next event), SVG curve, list of
 * upcoming highs/lows, attribution footer. State only; no network.
 */

import { LitElement, css, html, nothing, svg, type PropertyValues, type TemplateResult } from "lit";

import { buildChart, type ChartModel } from "./chart";
import { parseTideEntity, type TideData, type TideEvent } from "./contract";
import { OpenTidesCardEditor } from "./editor";
import { readExtra, siblingEntityId, type ExtraStat } from "./extras";
import {
  formatDayTime,
  formatDisplayHeight,
  formatDuration,
  formatHeight,
  formatTime,
  formatWeekday,
  heightUnit,
  language,
  localHourOf,
  toUnit,
} from "./format";
import {
  resolveConfig,
  type HomeAssistant,
  type OpenTidesCardConfig,
  type ResolvedConfig,
} from "./ha-types";
import { localize } from "./i18n";
import { nextEvent, stateAt } from "./tide";

const CARD_TYPE = "open-tides-card";
const CHART_HEIGHT = 150;
const TICK_MS = 60_000;

export class OpenTidesCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _now: { state: true },
    _width: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: ResolvedConfig;
  private _now = Date.now();
  private _width = 0;
  private _timer?: number;
  private _ro?: ResizeObserver;

  // ---- Lovelace API -------------------------------------------------------

  static getConfigElement(): HTMLElement {
    return document.createElement(`${CARD_TYPE}-editor`);
  }

  static getStubConfig(
    hass: HomeAssistant,
    entities: string[],
    entitiesFallback: string[],
  ): OpenTidesCardConfig {
    const isTide = (id: string) =>
      id.startsWith("sensor.") &&
      id.endsWith("_tide") &&
      Array.isArray(hass.states[id]?.attributes?.events);
    const entity = [...entities, ...entitiesFallback].find(isTide) ?? "";
    return { type: `custom:${CARD_TYPE}`, entity };
  }

  setConfig(config: OpenTidesCardConfig): void {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._config = resolveConfig(config);
  }

  getCardSize(): number {
    return this._rows();
  }

  getGridOptions() {
    return { columns: 12, rows: this._rows(), min_columns: 6, min_rows: 2 };
  }

  private _rows(): number {
    const c = this._config;
    if (!c) return 3;
    let px = 32; // card padding
    if (c.show_header) px += 64;
    if (c.extras.length) px += 56;
    if (c.show_curve) px += CHART_HEIGHT + 8;
    if (c.show_events) px += 4 + c.events_count * 28;
    px += 22; // footer
    return Math.max(1, Math.ceil(px / 64));
  }

  // ---- lifecycle ----------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    this._startClock();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopClock();
    this._ro?.disconnect();
    this._ro = undefined;
  }

  private _startClock(): void {
    this._stopClock();
    this._now = Date.now();
    // fire on the minute so "in 2h 14m" ticks in step with wall clocks
    const delay = TICK_MS - (this._now % TICK_MS);
    this._timer = window.setTimeout(() => {
      this._now = Date.now();
      this._timer = window.setInterval(() => (this._now = Date.now()), TICK_MS);
    }, delay);
  }

  private _stopClock(): void {
    if (this._timer !== undefined) {
      window.clearTimeout(this._timer);
      window.clearInterval(this._timer);
      this._timer = undefined;
    }
  }

  override firstUpdated(): void {
    this._observeChart();
  }

  override updated(): void {
    // The chart div only exists once there is data; attach when it appears.
    if (!this._ro) this._observeChart();
  }

  private _observeChart(): void {
    const host = this.renderRoot.querySelector(".chart");
    if (host && "ResizeObserver" in window) {
      this._ro = new ResizeObserver((entries) => {
        const w = Math.floor(entries[0]?.contentRect.width ?? 0);
        if (w !== this._width) this._width = w;
      });
      this._ro.observe(host);
    }
  }

  /** Re-render on hass only when our entity's state object changed. */
  override shouldUpdate(changed: PropertyValues): boolean {
    if (changed.size === 1 && changed.has("hass")) {
      const old = changed.get("hass") as HomeAssistant | undefined;
      const c = this._config;
      if (!old || !c?.entity) return true;
      if (old.locale !== this.hass?.locale) return true;
      const ids = [c.entity, ...c.extras.map((k) => siblingEntityId(c.entity, k) ?? "")];
      return ids.some((id) => old.states[id] !== this.hass?.states[id]);
    }
    return true;
  }

  // ---- render -------------------------------------------------------------

  override render(): TemplateResult | typeof nothing {
    const c = this._config;
    const hass = this.hass;
    if (!c || !hass) return nothing;
    if (!c.entity) return this._error(localize(hass, "errors.no_entity"));
    const entity = hass.states[c.entity];
    if (!entity) return this._error(localize(hass, "errors.not_found", { entity: c.entity }));
    if (entity.state === "unavailable")
      return this._error(localize(hass, "errors.unavailable", { entity: c.entity }), "warning");

    const data = parseTideEntity(entity);
    const now = this._now;
    const title = c.name ?? data.station ?? c.entity;
    const upcoming = nextEvent(data.events, now);
    const lastUpdated = entity.last_updated ? Date.parse(entity.last_updated) : NaN;

    const banners: TemplateResult[] = [];
    for (const w of data.warnings) banners.push(this._alert(w, "warning"));
    if (data.events.length === 0) {
      banners.push(this._alert(localize(hass, "no_forecast"), "info"));
    } else if (!upcoming) {
      const ago = Number.isFinite(lastUpdated) ? formatDuration(now - lastUpdated) : "?";
      banners.push(this._alert(localize(hass, "stale", { ago }), "warning"));
    }

    return html`
      <ha-card>
        <div class="card">
          ${banners}
          ${c.show_header ? this._header(title, data, now) : nothing}
          ${c.extras.length ? this._extras(now) : nothing}
          ${c.show_curve && data.events.length > 1 ? this._chart(data, now) : nothing}
          ${c.show_events && data.events.length > 0 ? this._events(data, now) : nothing}
          ${this._footer(data)}
        </div>
      </ha-card>
    `;
  }

  private _error(msg: string, type: "error" | "warning" = "error"): TemplateResult {
    return html`<ha-card><div class="card">${this._alert(msg, type)}</div></ha-card>`;
  }

  private _alert(msg: string, type: "error" | "warning" | "info"): TemplateResult {
    return html`<ha-alert alert-type=${type}>${msg}</ha-alert>`;
  }

  private _header(title: string, data: TideData, now: number): TemplateResult {
    const hass = this.hass;
    const unit = heightUnit(this._config!, hass);
    const lang = language(hass);
    const state = stateAt(data.events, now);
    const next = nextEvent(data.events, now);
    const icon =
      state === "rising" ? "mdi:wave-arrow-up" : state === "falling" ? "mdi:wave-arrow-down" : "mdi:wave";
    const stateLabel = localize(hass, `state.${state ?? "unknown"}`);
    return html`
      <div class="header">
        <div class="title-row">
          <div class="title">${title}</div>
          <div class="state ${state ?? ""}">
            <ha-icon icon=${icon}></ha-icon>
            <span>${stateLabel}</span>
          </div>
        </div>
        ${next
          ? html`<div class="next">
              <span class="kind ${next.type}">${localize(hass, next.type)}</span>
              <span class="height">${formatHeight(next.height, unit, lang)}</span>
              <span class="when">
                ${localize(hass, "in", { duration: formatDuration(next.time - now) })}
                · ${formatDayTime(next.time, now, hass)}
              </span>
            </div>`
          : nothing}
      </div>
    `;
  }

  private _extras(now: number): TemplateResult | typeof nothing {
    const hass = this.hass!;
    const c = this._config!;
    const unit = heightUnit(c, hass);
    const lang = language(hass);
    const stats = c.extras
      .map((k) => readExtra(hass, c.entity, k, now, unit, lang))
      .filter((x): x is ExtraStat => x !== null);
    if (stats.length === 0) return nothing;
    return html`
      <div class="extras">
        ${stats.map(
          (x) => html`
            <div class="stat" title=${x.entityId}>
              <div class="stat-label">${x.label}</div>
              <div class="stat-value ${x.trend ?? ""}">
                ${x.trend === "up"
                  ? html`<ha-icon icon="mdi:arrow-up-thin"></ha-icon>`
                  : x.trend === "down"
                    ? html`<ha-icon icon="mdi:arrow-down-thin"></ha-icon>`
                    : nothing}
                ${x.value}
              </div>
              ${x.sub ? html`<div class="stat-sub">${x.sub}</div>` : nothing}
            </div>`,
        )}
      </div>
    `;
  }

  private _chart(data: TideData, now: number): TemplateResult {
    const hass = this.hass;
    const c = this._config!;
    const unit = heightUnit(c, hass);
    const lang = language(hass);
    const width = this._width || 300;
    const model = buildChart({
      events: data.events,
      curve: data.curve,
      now,
      hoursBack: c.hours_back,
      hoursAhead: c.hours_ahead,
      width,
      height: CHART_HEIGHT,
      toDisplay: (m) => toUnit(m, unit),
      hourOf: localHourOf(hass),
    });
    return html`<div class="chart">${model.empty ? nothing : this._svg(model, lang)}</div>`;
  }

  private _svg(m: ChartModel, lang: string): TemplateResult {
    const hass = this.hass;
    const { plot } = m;
    const clipId = `otc-clip-${Math.round(m.width)}`;
    const approx = m.approximate;
    return svg`
      <svg
        class="curve ${approx ? "approx" : ""}"
        viewBox="0 0 ${m.width} ${m.height}"
        width=${m.width}
        height=${m.height}
        role="img"
        aria-label=${approx ? localize(hass, "approximate") : ""}
      >
        <defs>
          <clipPath id=${clipId}>
            <rect x=${plot.x0} y=${plot.y0} width=${plot.x1 - plot.x0} height=${plot.y1 - plot.y0}></rect>
          </clipPath>
        </defs>
        ${m.yTicks.map(
          (t) => svg`
            <line class="grid" x1=${plot.x0} x2=${plot.x1} y1=${t.y} y2=${t.y}></line>
            <text class="ylabel" x=${plot.x0 - 6} y=${t.y} dy="0.35em" text-anchor="end">
              ${formatDisplayHeight(t.value, lang, 1)}
            </text>`,
        )}
        ${m.xTicks.map(
          (t) => svg`
            <line class="grid ${t.major ? "major" : ""}" x1=${t.x} x2=${t.x} y1=${plot.y0} y2=${plot.y1}></line>
            <text class="xlabel ${t.major ? "major" : ""}" x=${t.x} y=${plot.y1 + 14} text-anchor="middle">
              ${t.major ? formatWeekday(t.time, hass) : formatTime(t.time, hass)}
            </text>`,
        )}
        <g clip-path="url(#${clipId})">
          <path class="area" d=${m.areaPath}></path>
          <path class="line" d=${m.linePath}>
            ${approx ? svg`<title>${localize(hass, "approximate")}</title>` : nothing}
          </path>
        </g>
        <line class="now" x1=${m.now.x} x2=${m.now.x} y1=${plot.y0} y2=${plot.y1}></line>
        ${m.now.y !== null ? svg`<circle class="now-dot" cx=${m.now.x} cy=${m.now.y} r="3.5"></circle>` : nothing}
        ${m.markers.map((k) => {
          const ty = k.below ? k.y + 14 : k.y - 8;
          const label = formatDisplayHeight(k.height, lang, 1);
          return svg`
            <circle class="marker ${k.type}" cx=${k.x} cy=${k.y} r="3.5">
              <title>${localize(hass, k.type)} ${label} ${formatDayTime(k.time, m.domain.t0, hass)}</title>
            </circle>
            <text class="mlabel ${k.type}" x=${k.x} y=${ty} text-anchor="middle">${label}</text>`;
        })}
      </svg>
    `;
  }

  private _events(data: TideData, now: number): TemplateResult {
    const hass = this.hass;
    const c = this._config!;
    const unit = heightUnit(c, hass);
    const lang = language(hass);
    const rows = data.events.filter((e) => e.time > now).slice(0, c.events_count);
    if (rows.length === 0) {
      return html`<div class="events empty">${localize(hass, "no_upcoming")}</div>`;
    }
    return html`
      <div class="events">
        ${rows.map((e: TideEvent) => {
          const delta = e.time - now;
          return html`
            <div class="row">
              <ha-icon class="${e.type}" icon=${e.type === "high" ? "mdi:arrow-up-thin" : "mdi:arrow-down-thin"}></ha-icon>
              <span class="kind">${localize(hass, e.type)}</span>
              <span class="time">${formatDayTime(e.time, now, hass)}</span>
              <span class="rel">${localize(hass, "in", { duration: formatDuration(delta) })}</span>
              <span class="height">${formatHeight(e.height, unit, lang, 2)}</span>
            </div>`;
        })}
      </div>
    `;
  }

  private _footer(data: TideData): TemplateResult | typeof nothing {
    const hass = this.hass;
    if (!data.attribution && !data.datum) return nothing;
    return html`
      <div class="footer">
        ${data.attribution
          ? data.licenceUrl
            ? html`<a href=${data.licenceUrl} target="_blank" rel="noopener">${data.attribution}</a>`
            : html`<span>${data.attribution}</span>`
          : nothing}
        ${data.datum ? html`<span class="datum">${localize(hass, "datum", { datum: data.datum })}</span>` : nothing}
      </div>
    `;
  }

  // ---- styles -------------------------------------------------------------

  static override styles = css`
    :host {
      --otc-curve: var(--open-tides-curve-color, var(--primary-color));
      --otc-high: var(--open-tides-high-color, var(--primary-color));
      --otc-low: var(--open-tides-low-color, var(--secondary-text-color));
      --otc-now: var(--open-tides-now-color, var(--primary-text-color));
      --otc-grid: var(--divider-color);
      --otc-label: var(--secondary-text-color);
    }
    ha-card {
      overflow: hidden;
    }
    .card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    ha-alert {
      display: block;
    }

    /* header */
    .title-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }
    .title {
      font-size: 1.2em;
      font-weight: 500;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .state {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .state ha-icon {
      --mdc-icon-size: 22px;
      color: var(--otc-curve);
    }
    .next {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 6px;
      color: var(--primary-text-color);
      margin-top: 2px;
    }
    .next .kind {
      font-weight: 500;
    }
    .next .kind.high {
      color: var(--otc-high);
    }
    .next .kind.low {
      color: var(--otc-low);
    }
    .next .height {
      font-size: 1.3em;
      font-weight: 500;
    }
    .next .when {
      color: var(--secondary-text-color);
    }

    /* extras */
    .extras {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
    }
    .stat {
      flex: 1 1 120px;
      min-width: 0;
    }
    .stat-label {
      font-size: 0.75em;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color);
    }
    .stat-value {
      font-size: 1.1em;
      font-weight: 500;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .stat-value ha-icon {
      --mdc-icon-size: 18px;
      margin-left: -4px;
    }
    .stat-value.up ha-icon {
      color: var(--otc-high);
    }
    .stat-value.down ha-icon {
      color: var(--otc-low);
    }
    .stat-sub {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }

    /* chart */
    .chart {
      width: 100%;
      line-height: 0;
    }
    svg.curve {
      display: block;
      max-width: 100%;
      overflow: visible;
      font-family: inherit;
    }
    .grid {
      stroke: var(--otc-grid);
      stroke-width: 1;
    }
    .grid.major {
      stroke-width: 1.5;
    }
    .xlabel,
    .ylabel {
      fill: var(--otc-label);
      font-size: 10px;
    }
    .xlabel.major {
      font-weight: 600;
    }
    .area {
      fill: var(--otc-curve);
      fill-opacity: 0.12;
      stroke: none;
    }
    .line {
      fill: none;
      stroke: var(--otc-curve);
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    svg.approx .line {
      stroke-dasharray: 5 4;
    }
    .now {
      stroke: var(--otc-now);
      stroke-width: 1;
      stroke-dasharray: 2 3;
      opacity: 0.8;
    }
    .now-dot {
      fill: var(--card-background-color);
      stroke: var(--otc-now);
      stroke-width: 2;
    }
    .marker {
      stroke: var(--card-background-color);
      stroke-width: 1.5;
    }
    .marker.high {
      fill: var(--otc-high);
    }
    .marker.low {
      fill: var(--otc-low);
    }
    .mlabel {
      font-size: 10.5px;
      font-weight: 600;
    }
    .mlabel.high {
      fill: var(--otc-high);
    }
    .mlabel.low {
      fill: var(--otc-low);
    }

    /* events list */
    .events {
      display: flex;
      flex-direction: column;
    }
    .events.empty {
      color: var(--secondary-text-color);
      font-style: italic;
    }
    .row {
      display: grid;
      grid-template-columns: 24px auto auto 1fr auto;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      border-top: 1px solid var(--otc-grid);
      color: var(--primary-text-color);
    }
    .row:first-child {
      border-top: none;
    }
    .row ha-icon {
      --mdc-icon-size: 20px;
    }
    .row ha-icon.high {
      color: var(--otc-high);
    }
    .row ha-icon.low {
      color: var(--otc-low);
    }
    .row .kind {
      font-weight: 500;
    }
    .row .time {
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .row .rel {
      color: var(--secondary-text-color);
      font-size: 0.9em;
      text-align: right;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row .height {
      font-variant-numeric: tabular-nums;
      text-align: right;
      white-space: nowrap;
    }

    /* footer */
    .footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 4px 12px;
      font-size: 0.75em;
      color: var(--secondary-text-color);
    }
    .footer a {
      color: inherit;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  `;
}

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
  interface HTMLElementTagNameMap {
    "open-tides-card": OpenTidesCard;
    "open-tides-card-editor": OpenTidesCardEditor;
  }
}

if (!customElements.get(CARD_TYPE)) customElements.define(CARD_TYPE, OpenTidesCard);
if (!customElements.get(`${CARD_TYPE}-editor`))
  customElements.define(`${CARD_TYPE}-editor`, OpenTidesCardEditor);

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: CARD_TYPE,
  name: "Open Tides Card",
  description: "Tide curve, state and next high/low from the open_tides integration.",
  preview: true,
  documentationURL: "https://github.com/gerrowadat/open-tides-card",
});
