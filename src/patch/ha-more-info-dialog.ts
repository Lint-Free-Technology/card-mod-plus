import { patch_element } from "../helpers/patch_function";
import { ModdedElement, apply_uix } from "../helpers/apply_uix";

/*
Patch ha-more-info-dialog to style more-info popups.

There is no style passed to apply_uix here, everything comes only from themes.
*/

@patch_element("ha-more-info-dialog")
class MoreInfoDIalogPatch extends ModdedElement {
  showDialog(_orig, params, ...rest) {
    _orig?.(params, ...rest);

    this.requestUpdate();
    this.updateComplete.then(async () => {
      const haDialog = this.shadowRoot.querySelector("ha-adaptive-dialog") ?? this.shadowRoot.querySelector("ha-dialog");
      if (!haDialog) return;

      apply_uix(
        haDialog as ModdedElement,
        "more-info",
        undefined,
        {
          config: params,
        },
        false
      );
    });
  }
}
