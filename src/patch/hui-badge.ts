import { patch_element } from "../helpers/patch_function";
import { ModdedElement, apply_uix } from "../helpers/apply_uix";

const EXCLUDED_BADGES = [
  "entity-filter",
];

@patch_element("hui-badge")
class HuiBadgePatch extends ModdedElement {
  _element: ModdedElement;
  config;

  async _add_uix() {
    if (!this._element) return;
    if (EXCLUDED_BADGES.includes(this.config?.type?.toLowerCase())) return;
    
    const cls = `type-${this.config?.type?.replace?.(":", "-")}`;

    await apply_uix(
      this._element,
      "badge",
      this.config?.uix ?? this.config?.card_mod,
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
