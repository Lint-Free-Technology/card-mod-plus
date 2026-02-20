import { LitElement } from "lit";
import { Uix } from "../uix";

export class ModdedElement extends LitElement {
  _uix: Uix[] = [];
  modElement?: ModdedElement;

  setConfig(_orig, config, ...args) {
    _orig?.(config, ...args);
    this._uix.forEach((uix) => {
      uix.variables = { config };
      uix.styles = config.uix?.style || config.card_mod?.style || {};
    });
  }

  updated(_orig, ...args) {
    _orig?.(...args);
    Promise.all([this.updateComplete]).then(() =>
      this._uix.forEach((uix) => uix.refresh?.())
    );
  }
}

export type UixStyle = string | { [key: string]: UixStyle };

interface UixConfig {
  style?: UixStyle;
  class?: string | string[];
  debug?: boolean;
  prepend?: boolean;
}

export async function apply_uix_compatible(
  element: ModdedElement,
  type: string,
  uix_config: UixStyle | UixConfig = undefined, // or styles
  variables = {},
  shadow = true, // or deprecated
  cls = undefined // or shadow
) {
  // TODO: Remove ????
  // This is for backwards compatibility with Card mod version 3.3 and earlier.

  // Wrapper for backwards compatibility (with deprecation warning)
  // Old signature:
  //   el: Node
  //   type: string
  //   styles: CardModStyle = ""
  //   variables: object = {}
  //   _: any = null
  //   shadow: boolean = true
  //
  // New signature
  //   el: Node
  //   type: string
  //   cm_config: CardModConfig
  //   variables: object = {}
  //   shadow: boolean = true
  //   cls: str = undefined

  let oldStyle = false;
  if (cls !== undefined) {
    if (typeof cls !== "string") {
      // Old style call
      oldStyle = true;
      shadow = cls;
      cls = undefined;
    }
  }
  if (typeof shadow !== "boolean") {
    // Old style call
    shadow = true;
    oldStyle = true;
  }
  if (typeof uix_config === "string") {
    // Old style call with string styles
    uix_config = { style: uix_config };
    oldStyle = true;
  }
  if (
    uix_config &&
    Object.keys(uix_config).length !== 0 &&
    (uix_config?.style ?? uix_config?.class ?? uix_config?.debug) === undefined
  ) {
    // Old style call with object styles
    uix_config = { style: uix_config as UixStyle };
    oldStyle = true;
  }

  if (oldStyle && !(window as any).uix_compatibility_warning) {
    (window as any).uix_compatibility_warning = true;
    console.groupCollapsed("UIX warning");
    console.info(
      "You are using a custom card which relies on UIX, and uses an outdated signature for applyToElement."
    );
    console.info(
      "The outdated signature will be removed at some point in the future. Hopefully the developer of your card will have updated their card by then."
    );
    console.info("The card used UIX to apply styles here:", element);
    console.groupEnd();
  }

  return apply_uix(element, type, uix_config, variables, shadow, cls);
}

export async function apply_uix(
  element: ModdedElement,
  type: string,
  uix_config: UixConfig = undefined,
  variables = {},
  shadow: boolean = true,
  cls = undefined
) {
  const debug = uix_config?.debug
    ? (...msg) => console.log("UIX Debug:", ...msg)
    : (...msg) => {};

  debug(
    "Applying UIX to:",
    ...((element as any)?.host
      ? ["#shadow-root of:", (element as any)?.host]
      : [element]),
    "type: ",
    type,
    "configuration: ",
    uix_config
  );

  if (!element) return;

  // Wait for target element to exist
  if (element.localName?.includes("-"))
    await customElements.whenDefined(element.localName);

  element._uix = element._uix || [];

  // Await uix-node element definition
  if (!customElements.get("uix-node")) {
    debug("Waiting for uix-node customElement to be defined");
    await customElements.whenDefined("uix-node");
  }

  // Find any existing uix-node elements of the right type
  const uix: Uix =
    element._uix.find((uix) => uix.type === type) ??
    document.createElement("uix-node") as Uix;

  debug("Applying UIX in:", uix);

  uix.type = type;
  uix.uix_class = cls;
  uix.debug = uix_config?.debug ?? false;
  uix.cancelStyleChild();

  if (!element._uix.includes(uix)) element._uix.push(uix);

  window.setTimeout(async () => {
    await Promise.all([element.updateComplete]);

    const target =
      element.modElement ?? shadow ? element.shadowRoot ?? element : element;

    if (!target.contains(uix as any)) {
      // Prepend if set or if Lit is in a buggy state
      const litWorkaround = (element as any)?.renderOptions?.renderBefore === null;
      if (litWorkaround) debug("Lit prepend workaround applied for:", element);
      if (uix_config?.prepend || litWorkaround) {
        target.prepend(uix as any);
      } else {
        target.appendChild(uix as any);
      }
    }

    uix.variables = variables;
    uix.styles = uix_config?.style ?? "";
  }, 1);

  uix.classes =
    typeof uix_config?.class == "string"
      ? uix_config?.class?.split?.(" ")
      : [...(uix_config?.class ?? [])];
  cls && uix.classes.push(cls);
  element.classList?.add(...uix.classes);

  return uix;
}
