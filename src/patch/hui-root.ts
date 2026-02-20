import { patch_element } from "../helpers/patch_function";
import { ModdedElement, apply_uix} from "../helpers/apply_uix";
import { selectTree } from "../helpers/selecttree";

/*
Patch hui-root for theme styling

There is no style passed to apply_uix here, everything comes only from themes.
*/

// hui-root may have been used before the patch was applied
const apply = () => {
  selectTree(
    document,
    "home-assistant$home-assistant-main$partial-panel-resolver ha-panel-lovelace$hui-root",
    false
  ).then((root) => root?.firstUpdated());
};

@patch_element("hui-root", apply)
class HuiRootPatch extends ModdedElement {
  firstUpdated(_orig, ...args) {
    _orig?.(...args);
    apply_uix(this, "root");
  }
}
