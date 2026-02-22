import { patch_element } from "../helpers/patch_function";
import { ModdedElement, apply_uix } from "../helpers/apply_uix";

/*
Patch ha-panel-profile for theme styling
Profile panels are routed via removing last Child and adding a new one.
Hence we need to prepend uix element to not interfere with the routing.

There is no style passed to apply_uix here, everything comes only from themes.

This will only work if uix loaded as a Frontend module.
*/

@patch_element("ha-panel-profile")
class HaPanelProfilePatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);
    apply_uix(this, "profile", { prepend: true });
  }
}
