import { hass, provideHass } from "../helpers/hass";

export const ConnectionMixin = (SuperClass) => {
  class UixConnection extends SuperClass {
    public hass;
    public connection;
    public ready = false;

    private _data;
    private _connected = false;
    private _connectionResolve;

    public connectionPromise = new Promise((resolve) => {
      this._connectionResolve = resolve;
    });

    LOG(...args) {
      if ((window as any).uix_log === undefined) return;
      const dt = new Date();
      console.log(`${dt.toLocaleTimeString()}`, ...args);

      if (this._connected) {
        try {
          this.connection.sendMessage({
            type: "uix/log",
            message: args[0],
          });
        } catch (err) {
         console.log("UIX: Error sending log:", err);
        }
      }
    }

    // Propagate internal browser event
    private fireBrowserEvent(event, detail = undefined) {
      this.dispatchEvent(new CustomEvent(event, { detail, bubbles: true }));
    }

    /*
     * Main state flags explained:
     * * `connected` and `disconnected` refers to WS connection,
     * * `ready` refers to established communication between browser and component counterpart.
     */

    // Component and frontend are mutually ready
    private onReady = () => {
      this.ready = true;
      this.LOG("Integration ready: UIX loaded and update received");
      this.fireBrowserEvent("uix-ready");
      this.userReady()
        .then(() => {
          this.onUserReady();
        })
        .catch((err) => {
          console.log(`UIX: ${err}. User Frontend settings have not been applied`);
        });
    }

    // WebSocket has connected
    private onConnected = () => {
      this._connected = true;
      this.LOG("WebSocket connected");
    }

    // WebSocket has disconnected
    private onDisconnected = () => {
      this.ready = false;
      this._connected = false;
      this.LOG("WebSocket disconnected");
      this.fireBrowserEvent("uix-disconnected");
    }

    private async userReady() {
      if (this.user) {
        return true;
      } else {
        let cnt = 0;
        while (!this.user&& cnt++ < 20) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (this.user) return true;
        throw new Error("User data not available after 10 seconds");
      }
    }

    private onUserReady = () => {
      this.LOG("Hass user data ready");
      this.fireBrowserEvent("uix-user-ready");
    }

    // Handle incoming message
    private incoming_message(msg) {
      // Set that have a connection. Allows logging
      if (!this._connected) {
        this.onConnected();
      }
      // Handle messages
      if (msg.command) {
        this.LOG("Command:", msg);
        this.fireBrowserEvent(`uix-command-${msg.command}`, msg);
      } else if (msg.result) {
        this.update_config(msg.result);
      }
      // Resolve first connection promise
      this._connectionResolve?.();
      this._connectionResolve = undefined;
    }

    private update_config(cfg) {
      // Future update handling can be added here, for now just update config and fire event
      this._data = cfg;
      this.LOG("Receive:", cfg);

      let update = false;

      // Check for readiness (of component and browser)
      if (!this.ready) {
        this.onReady();
      }
      this.fireBrowserEvent("uix-config-update");

      // future update handling can be added here
      // if (update) this.sendUpdate({});
    }

    async connect() {
      const conn = (await hass()).connection;
      this.connection = conn;

      const connectUixComponent = () => {
        this.LOG("Subscribing to uix/connect events");
        conn.subscribeMessage((msg) => this.incoming_message(msg), {
          type: "uix/connect",
          browserID: this.browserID,
        }).catch((err) => {
          console.error("UIX: Error connecting");
        });
      };

      // Initial connect component subscription
      connectUixComponent();
      // Observe `component_loaded` to track when `uix` is added after Home Assistant startup, such as during a restart or update. 
      // This ensures the connection is re-established and the component receives updates.
      conn.subscribeEvents((haEvent) => {
        if (haEvent.data?.component === "uix") {
          this.LOG("Detected uix component load");
          connectUixComponent();
        }
      }, "component_loaded");

      // Keep connection status up to date
      conn.addEventListener("ready", () => {
        this.onConnected();
      });
      conn.addEventListener("disconnected", () => {
        this.onDisconnected();
      });
      window.addEventListener("connection-status", (ev: CustomEvent) => {
        if (ev.detail === "connected") {
          this.onConnected();
        }
        if (ev.detail === "disconnected") {
          this.onDisconnected();
        }
      });

      provideHass(this);
    }

    get config() {
      return this._data?.config ?? {};
    }

    get user() {
      return this.hass?.user;
    }

    get version() {
      return this._data?.version;
    }
  }

  return UixConnection;
};