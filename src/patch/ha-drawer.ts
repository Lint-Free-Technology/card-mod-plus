import { ModdedElement, apply_uix } from "../helpers/apply_uix";
import { patch_element } from "../helpers/patch_function";

/*
Patch ha-drawer for theme styling

There is no style passed to apply_uix here, everything comes only from themes.

*/

@patch_element("ha-drawer")
class HaDrawerPatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);
    apply_uix(this, "drawer", undefined, {}, true);
  }
}