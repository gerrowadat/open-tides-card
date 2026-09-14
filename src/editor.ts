/**
 * Visual config editor. Uses HA's `ha-form` with a selector schema so it
 * picks up HA's own widgets and theming; nothing hand-built.
 */

import { LitElement, css, html, nothing, type TemplateResult } from "lit";

import { MAX_HOURS, type HomeAssistant, type OpenTidesCardConfig } from "./ha-types";
import { localize } from "./i18n";

type Schema = Array<Record<string, unknown>>;

function schema(hass: HomeAssistant | undefined): Schema {
  const t = (k: string) => localize(hass, `editor.${k}`);
  return [
    {
      name: "entity",
      required: true,
      selector: { entity: { domain: "sensor", integration: "open_tides" } },
    },
    { name: "name", selector: { text: {} } },
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "hours_ahead",
          selector: { number: { min: 1, max: MAX_HOURS, step: 1, mode: "box", unit_of_measurement: "h" } },
        },
        {
          name: "hours_back",
          selector: { number: { min: 0, max: MAX_HOURS, step: 1, mode: "box", unit_of_measurement: "h" } },
        },
      ],
    },
    {
      type: "grid",
      name: "",
      schema: [
        { name: "show_header", selector: { boolean: {} } },
        { name: "show_curve", selector: { boolean: {} } },
        { name: "show_events", selector: { boolean: {} } },
        {
          name: "events_count",
          selector: { number: { min: 1, max: 12, step: 1, mode: "box" } },
        },
      ],
    },
    {
      name: "height_unit",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "auto", label: t("unit_auto") },
            { value: "m", label: t("unit_m") },
            { value: "ft", label: t("unit_ft") },
          ],
        },
      },
    },
  ];
}

const DEFAULTS: Required<Omit<OpenTidesCardConfig, "type" | "entity" | "name">> = {
  hours_ahead: 36,
  hours_back: 6,
  show_header: true,
  show_curve: true,
  show_events: true,
  events_count: 4,
  height_unit: "auto",
};

export class OpenTidesCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: OpenTidesCardConfig;

  setConfig(config: OpenTidesCardConfig): void {
    this._config = config;
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const data = { ...DEFAULTS, ...this._config };
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${schema(this.hass)}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }

  private _label = (s: { name: string }): string =>
    s.name ? localize(this.hass, `editor.${s.name}`) : "";

  private _helper = (s: { name: string }): string | undefined => {
    if (s.name === "name") return localize(this.hass, "editor.name_helper");
    if (s.name === "hours_ahead" || s.name === "hours_back")
      return localize(this.hass, "editor.hours_helper");
    return undefined;
  };

  private _changed(ev: CustomEvent<{ value: OpenTidesCardConfig }>): void {
    ev.stopPropagation();
    const value = ev.detail.value;
    // Emit only what differs from defaults so the YAML stays minimal.
    const config: Record<string, unknown> = { type: this._config?.type ?? "custom:open-tides-card" };
    for (const [k, v] of Object.entries(value)) {
      if (k === "type") continue;
      if (v === "" || v === undefined || v === null) continue;
      if (k in DEFAULTS && (DEFAULTS as Record<string, unknown>)[k] === v) continue;
      config[k] = v;
    }
    this._config = config as unknown as OpenTidesCardConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  static override styles = css`
    :host {
      display: block;
    }
  `;
}
