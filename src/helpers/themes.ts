import { hass } from "./hass";
import { yaml2json } from "./yaml2json";
import { Uix } from "../uix";
import { UixStyle } from "./apply_uix";
import { themesReady } from "../theme-watcher";

function cssValueIsTrue(v: string): boolean {
  if (!v) return false;
  const t = v.trim().toLowerCase();
  return t === "true" || t === "1" || t === "yes" || t === "on";
}

export async function get_theme(root: Uix): Promise<UixStyle> {
  if (!root.type) return null;

  await themesReady();

  const el = root.parentElement ? root.parentElement : root;
  const cs = window.getComputedStyle(el);
  const theme = cs.getPropertyPriority("--uix-theme") || cs.getPropertyValue("--card-mod-theme");

  // Determine debug flag from CSS variables.
  // Checked patterns:
  //  - --uix-<type>-debug
  //  - --uix-<type>-<class>-debug
  let debug = false;

  const typeDebug = cs.getPropertyValue(`--uix-${root.type}-debug`) || cs.getPropertyValue(`--card-mod-${root.type}-debug`);
  if (cssValueIsTrue(typeDebug)) debug = true;

  for (const cls of root.classes) {
    const debugVar = cs.getPropertyValue(`--uix-${root.type}-${cls}-debug`) || cs.getPropertyValue(`--card-mod-${root.type}-${cls}-debug`);
    if (cssValueIsTrue(debugVar)) {
      debug = true;
      break;
    }
  }

  root.debug ||= !!debug;

  root.debug && console.log("UIX Debug: Theme:", theme);

  const hs = await hass();
  if (!hs) return {};
  const themes = hs?.themes.themes ?? {};
  if (!themes[theme]) return {};

  if (themes[theme][`uix-${root.type}-yaml`]) {
    return yaml2json(themes[theme][`uix-${root.type}-yaml`]);
  } else if (themes[theme][`card-mod-${root.type}-yaml`]) {
    return yaml2json(themes[theme][`card-mod-${root.type}-yaml`]);
  } else if (themes[theme][`uix-${root.type}`]) {
    return { ".": themes[theme][`uix-${root.type}`] };
  } else if (themes[theme][`card-mod-${root.type}`]) {
    return { ".": themes[theme][`card-mod-${root.type}`] };
  } else {
    return {};
  }
}
