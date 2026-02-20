import { patch_element, patch_object } from "../helpers/patch_function";

import { apply_uix } from "../helpers/apply_uix";
import { ModdedElement } from "../helpers/apply_uix";

@patch_element("hui-heading-badge")
class HuiBadgePatch extends ModdedElement {
  _element: ModdedElement;
  config;

  async _add_uix() {
    if (!this._element) return;
    
    const cls = `type-${this.config?.type?.replace?.(":", "-")}`;

    await apply_uix(
      this._element,
      "heading-badge",
      this.config.uix ?? this.config.card_mod,
      { config: this.config },
      true,
      cls
    );
    this._uix = this._element._uix;
  }

  _loadElement(_orig, ...args) {
    _orig?.(...args);
    this._add_uix();
  }

  _updateElement(_orig, ...args) {
    _orig?.(...args);
    this._add_uix();
  }
}
