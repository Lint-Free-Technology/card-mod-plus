import { patch_element } from "../helpers/patch_function";
import { ModdedElement, apply_uix } from "../helpers/apply_uix";
import { selectTree } from "../helpers/selecttree";

/*
Patch ha-sidebar for theme styling

There is no style passed to apply_uix here, everything comes only from themes.
*/

// ha-sidebar may have been used before the patch was applied
const apply = () => {
  selectTree(
    document,
    "home-assistant$home-assistant-main$ha-sidebar",
    false
  ).then((root) => root?.firstUpdated());
};

@patch_element("ha-sidebar", apply)
class SidebarPatch extends ModdedElement {
  // @ts-ignore
  firstUpdated(_orig, ...args) {
    _orig?.(...args);
    apply_uix(this, "sidebar");
  }
}
