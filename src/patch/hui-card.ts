import { patch_element } from "../helpers/patch_function";

import { apply_uix } from "../helpers/apply_uix";
import { ModdedElement } from "../helpers/apply_uix";

const EXCLUDED_CARDS = [
  "conditional",
  "entity-filter",
];
@patch_element("hui-card")
class HuiCardPatch extends ModdedElement {
  _uix = [];
  _element: ModdedElement;
  config;

  async _add_card_mod() {
    if (!this._element) return;
    if (EXCLUDED_CARDS.includes(this.config?.type?.toLowerCase())) return;

    const element = this._element as any;
    const config = element?.config || element?._config || this.config;
    const cls = `type-${config?.type?.replace?.(":", "-")}`;

    await apply_uix(
      this._element,
      "card",
      config?.uix ?? config?.card_mod,
      { config },
      true,
      cls
    );
  }

  _loadElement(_orig, ...args) {
    _orig?.(...args);
    this._add_card_mod();
  }
}
