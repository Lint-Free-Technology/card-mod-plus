import { patch_element } from "../helpers/patch_function";
import { ModdedElement, apply_uix } from "../helpers/apply_uix";

/*
Patch ha-panel-config for theme styling
Config panels are routed via removing last Child and adding a new one.
Hence we need to prepend uix element to not interfere with the routing.

There is no style passed to apply_uix here, everything comes only from themes.

This will only work if uix loaded as a Frontend module.
*/

@patch_element("ha-panel-config")
class HaConfigPatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);
    apply_uix(this, "config", { prepend: true });
  }
}

/*
Patch ha-panel-custom
*/

@patch_element("ha-panel-custom")
class HaPanelCustomPatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);
    apply_uix(this, "panel-custom", { prepend: true });
  }
}

/* Patch ha-top-app-bar-fixed for theme styling
This is needed to best style the top app bar in the config panel.
The ultimate background styling for config panels come from this element.
*/

@patch_element("ha-top-app-bar-fixed")
class HaTopAppBarFixedPatch extends ModdedElement {
  updated(_orig, ...args) {
    _orig?.(...args);
    apply_uix(this, "top-app-bar-fixed");
  }
}
