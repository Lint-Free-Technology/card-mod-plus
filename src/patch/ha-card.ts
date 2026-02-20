import { patch_element, patch_object } from "../helpers/patch_function";
import { apply_uix } from "../helpers/apply_uix";
import { ModdedElement } from "../helpers/apply_uix";

/*
Patch the ha-card element to on first update:
- if it's parent is a hui-card, do nothing (as that is already handled in hui-card patch)
- try to find the config parameter of it's parent element
- Apply uix styles according to that config
*/

@patch_element("ha-card")
class HaCardPatch extends ModdedElement {
  _uix = [];
  async firstUpdated(_orig, ...args) {
    await _orig?.(...args);

    const huiCard = (this.parentNode as any)?.host?.parentNode;
    if (huiCard && huiCard.localName === "hui-card") return;

    const config = findConfig(this);
    if (!config) return;

    const cls = `type-${config?.type?.replace?.(":", "-")}`;
    await apply_uix(
      this,
      "card",
      config?.uix ?? config?.card_mod,
      { config },
      false,
      cls
    );

    const parent = (this.parentNode as any)?.host;
    if (!parent) return;

    patch_object(parent, ModdedElement);
    parent._uix = this._uix;
  }
}

interface LovelaceCard extends Node {
  config?: any;
  _config?: any;
  host?: LovelaceCard;
}

export function findConfig(node: LovelaceCard) {
  if (node.config) return node.config;
  if (node._config) return node._config;
  if (node.host) return findConfig(node.host);
  if (node.parentElement) return findConfig(node.parentElement);
  if (node.parentNode) return findConfig(node.parentNode);
  return null;
}
