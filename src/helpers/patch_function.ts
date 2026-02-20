import pjson from "../../package.json";
import { selectTree } from "./selecttree";

(window as any).uix_patch_state = (window as any).uix_patch_state || {};

const patchState: Record<string, {patched: boolean, version: string}> = (window as any).uix_patch_state;
const cardModPatchState: Record<string, {patched: boolean, version: string}> = (window as any).card_mod_patch_state;

const patch_method = function (obj, method, override) {
  if (method === "constructor") return;
  const original = obj[method];

  const fn = function (...args) {
    try {
      return override.call(this, original?.bind(this), ...args);
    } catch (e) {
      return original?.bind(this)(...args);
    }
  };
  obj[method] = fn;
};

export const set_patched = (element: HTMLElement) => {
  const key = typeof element === "string" ? element : element.constructor.name;
  patchState[key] = {patched: true, version: pjson.version};
};

export const is_patched = (element: HTMLElement) => {
  const key = typeof element === "string" ? element : element.constructor.name;
  return patchState[key]?.patched ?? patchState[key] ?? false;
};

export const patch_object = (obj, patch) => {
  if (!obj) return;
  for (const method in Object.getOwnPropertyDescriptors(patch.prototype)) {
    patch_method(obj, method, patch.prototype[method]);
  }
};

export const patch_prototype = async (cls, patch, afterwards?) => {
  if (typeof cls === "string") {
    await customElements.whenDefined(cls);
    cls = customElements.get(cls);
  }
  const patched = patch_object(cls.prototype, patch);
  afterwards?.();
  return patched;
};

// Decorator for patching a custom-element
export function patch_element(element, afterwards?) {
  return function patched(constructor) {
    const key = typeof element === "string" ? element : element.name;
    const patched = patchState[key]?.patched ?? patchState[key] ?? false;
    const cardModPatched = cardModPatchState?.[key]?.patched ?? cardModPatchState?.[key] ?? false;
    if (patched || cardModPatched) {
      log_patch_warning(key);
      return;
    }
    patchState[key] = {patched: true, version: pjson.version};
    patch_prototype(element, constructor, afterwards);
  };
}

function log_patch_warning(key) {
  if ((window as any).uix_patch_warning) return;
  (window as any).uix_patch_warning = true;
  const message = `UIX (${pjson.version}): ${key} already patched by ${patchState[key]?.version || (cardModPatchState[key] ? `Card-mod (${cardModPatchState[key]?.version || "unknown Card-mod version"})` : "unknown version")}!`;
  const details = [
    "Make sure you are using the latest version of UIX.",
  ];

  selectTree(document.body, "home-assistant").then((haEl) => {
    if (haEl?.hass) {
      const userIdComponent =
        haEl.hass.user?.name ??
        haEl.hass.user?.id ??
        "unknown_user";
      const userAgentComponent =
        typeof navigator !== "undefined" && navigator.userAgent;
      const info = `User: ${haEl.hass.user?.name || "unknown"}\n\nBrowser: ${navigator.userAgent}`;
      haEl.hass.callService(
        "system_log",
        "write",
        {
          logger: `uix.${pjson.version}`,
          level: "warning",
          message: `${message} ${details.join(" ")} ${info}`,
        },
        undefined,
        false
      ).catch(error => {
        console.error(
          "UIX: Failed to create duplicate patch warning notification",
          error
        );
      });
    }
  });
}