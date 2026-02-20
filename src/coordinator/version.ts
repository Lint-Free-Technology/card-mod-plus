import pjson from "../../package.json";
import { hass_base_el } from "../helpers/hass";
import { selectTree } from "../helpers/selecttree";
import { Actions } from "../ll-custom-actions";

export const VersionMixin = (SuperClass) => {
  return class VersionMixinClass extends SuperClass {
    _browserVersion: string;
    _versionNotificationPending: boolean = false;

    constructor() {
      super();
      this._browserVersion = pjson.version;
      this.addEventListener("uix-ready", async () => {
        await this._checkVersion();
      });
      this.addEventListener("uix-disconnected", () => {
        this._versionNotificationPending = false;
      });
    }

    async _checkVersion() {
      if (this.version && this.version !== this._browserVersion) {
        if (!this._versionNotificationPending) {
          this._versionNotificationPending = true;
          await this._localNotification(
            this.version,
            this._browserVersion
          )
        }
      }
    }

    async _localNotification(serverVersion, clientVersion) {
      // Wait for any other notifications to expire
      let haToast;
      do {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        haToast = await selectTree(
                document.body,
                "home-assistant $ notification-manager $ ha-toast",
                false,
                1000)
      } while (haToast);
      const message = `UIX version mismatch! Browser: ${clientVersion}, Home Assistant: ${serverVersion}`;
      const action = {
        text: "Reload",
        action: () => Actions.clear_cache()
      }
      const base = await hass_base_el();
      base.dispatchEvent(
        new CustomEvent("hass-notification", {
          detail: {
              message,
              action: action,
              duration: -1,
              dismissable: true,
          },
        })
      );
    }
  };
};
