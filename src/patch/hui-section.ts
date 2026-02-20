import { patch_element, patch_object } from "../helpers/patch_function";
import { apply_uix } from "../helpers/apply_uix";
import { ModdedElement } from "../helpers/apply_uix";

/*
Patch the hui-grid-section element to on first update:
- config is available in this._config as set by parent hui-section
*/

@patch_element("hui-grid-section")
class HuiGridSectionPatch extends ModdedElement {
  _config;
  firstUpdated(_orig, ...args) {
    _orig?.(...args);
    apply_uix(
      this,
      "grid-section",
      this._config.uix ?? this._config.card_mod,
      { config: this._config },
      true,
      "type-grid-section"
    );
  }
}

/*
Patch the hui-section element on first update:
- patch can only apply to strategies where cards can be modified
- apply uix to cards per types in uix config
*/

@patch_element("hui-section")
class HuiSectionPatch extends ModdedElement {
  async _createCards(_orig, ...args) {
    const strategyConfig = (this as LovelaceSection).config?.strategy;
    const dynamicConfig: LovelaceSectionConfig | undefined = { ...args[0] };
    if (strategyConfig && (strategyConfig.uix || strategyConfig.card_mod)) {
      Object.entries(dynamicConfig.cards).forEach(([idx, card]) => {
        if (card.type && (card.type in strategyConfig.uix || card.type in strategyConfig.card_mod)) {
          (strategyConfig.uix?.debug || strategyConfig.card_mod?.debug) &&
            console.log(
              "UIX Debug: adding uix to card",
              card,
              "with",
              strategyConfig.uix?.[card.type] ?? strategyConfig.card_mod?.[card.type]
            );
          dynamicConfig.cards[idx] = {
            ...card,
            uix: strategyConfig.uix?.[card.type] ?? strategyConfig.card_mod?.[card.type],
          };
        }
      });
    }
    _orig?.(dynamicConfig);
  }
}

interface LovelaceSection extends Node {
  config?: LovelaceSectionConfig;
}

interface LovelaceCardConfig {
  type?: string;
  uix?: { [key: string]: any };
  card_mod?: { [key: string]: any };
}

interface LovelaceSectionConfig {
  strategy?: { [key: string]: any };
  type?: string;
  cards?: LovelaceCardConfig[];
  uix?: { [key: string]: any };
  card_mod?: { [key: string]: any };
}
