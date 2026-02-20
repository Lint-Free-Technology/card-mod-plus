import { patch_element, patch_object } from "../helpers/patch_function";
import { apply_uix } from "../helpers/apply_uix";
import { ModdedElement } from "../helpers/apply_uix";

/*
Patch ha-assist-chip on first update
*/

@patch_element("ha-assist-chip")
class HaAssistChipPatch extends ModdedElement {
  config;

  async firstUpdated(_orig, ...args) {
    await _orig?.(...args);

    await apply_uix(
      this,
      "assist-chip",
      this.config?.uix ?? this.config?.card_mod,
      { config: this.config },
      true,
      "type-assist-chip"
    );
  }
}

