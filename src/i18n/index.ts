import en from "./en.json";
import type { HomeAssistant } from "../ha-types";

type Dict = { [k: string]: string | Dict };
const LANGS: Record<string, Dict> = { en };

function lookup(dict: Dict, path: string): string | undefined {
  let cur: string | Dict | undefined = dict;
  for (const part of path.split(".")) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = cur[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

/**
 * Translate `key` ("errors.not_found") for the HA UI language, falling back
 * to English, substituting `{name}` placeholders from `vars`.
 */
export function localize(
  hass: HomeAssistant | undefined,
  key: string,
  vars: Record<string, string | number> = {},
): string {
  const lang = (hass?.locale?.language ?? hass?.language ?? "en").toLowerCase();
  const dict = LANGS[lang] ?? LANGS[lang.split("-")[0] ?? "en"] ?? en;
  let s = lookup(dict, key) ?? lookup(en, key) ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
