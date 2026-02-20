import { LitElement } from "lit";
import { patch_element, patch_object } from "../helpers/patch_function";

class ConfigElementPatch extends LitElement {
  _uixData?;

  setConfig(_orig, config, ...rest) {
    const newConfig = JSON.parse(JSON.stringify(config));

    // Save uix config
    this._uixData = {
      uix: undefined,
      card_mod: undefined,
      entities: [],
    };
    if (newConfig.uix) {
      this._uixData.uix = newConfig.uix;
    } else if (newConfig.card_mod) {
      this._uixData.card_mod = newConfig.card_mod;
    }
    delete newConfig.uix;
    delete newConfig.card_mod;

    // Save uix config for individual entities
    if (Array.isArray(newConfig.entities)) {
      for (const [i, e] of newConfig.entities?.entries?.()) {
        this._uixData.entities[i] = { uix: undefined, card_mod: undefined };
        if (e.uix) {
          this._uixData.entities[i].uix = e.uix;
        } else if (e.card_mod) {
          this._uixData.entities[i].card_mod = e.card_mod;
        }
        delete e.uix;
        delete e.card_mod;
      }
    }

    _orig(newConfig, ...rest);
  }
}

@patch_element("hui-card-element-editor")
class HuiCardElementEditorPatch extends LitElement {
  _configElement?: ConfigElementPatch;

  async getConfigElement(_orig, ...args) {
    const retval = await _orig(...args);

    patch_object(retval, ConfigElementPatch);

    return retval;
  }

  _handleConfigChanged(_orig, ev, ...rest) {
    const uixData = this._configElement?._uixData;
    if (uixData && (uixData.uix)) {
      ev.detail.config.uix = uixData.card;
    }
    if (uixData && uixData.card_mod) {
      ev.detail.config.card_mod = uixData.card_mod;
    }
    if (uixData && Array.isArray(uixData.entities)) {
      for (const [i, e] of uixData.entities.entries()) {
        if (e.uix) {
          ev.detail.config.entities[i].uix = e.uix;
        }
        if (e.card_mod) {
          ev.detail.config.entities[i].card_mod = e.card_mod;
        }
      }
    }

    _orig(ev, ...rest);
  }
}

@patch_element("hui-dialog-edit-card")
class HuiDialogEditCardPatch extends LitElement {
  _uixIcon?;
  _cardConfig?;

  updated(_orig, ...args) {
    _orig?.(...args);
    if (!this._uixIcon) {
      this._uixIcon = document.createElement("ha-icon");
      this._uixIcon.icon = "mdi:brush";
    }

    const button = this.shadowRoot.querySelector(
      "ha-button[slot=secondaryAction]"
    );
    if (!button) return;
    button.appendChild(this._uixIcon);
    if (
      JSON.stringify(this._cardConfig)?.includes("uix") || JSON.stringify(this._cardConfig)?.includes("card_mod")
    ) {
      this._uixIcon.style.visibility = "visible";
    } else {
      this._uixIcon.style.visibility = "hidden";
    }
  }
}
