// Add a listener to allow to clear Frontend cache via Home Assistant action
window.addEventListener("uix-bootstrap", async (ev) => {
    ev.stopPropagation();
    document.addEventListener("ll-custom", (event) => {
        var _a;
        const detail = event.detail;
        if (!detail || typeof detail !== "object") {
            return;
        }
        const uix = (_a = detail.uix) !== null && _a !== void 0 ? _a : detail.card_mod;
        if (!uix || typeof uix !== "object") {
            return;
        }
        const actionName = uix.action;
        if (actionName && typeof actionName === "string" && typeof Actions[actionName] === "function") {
            try {
                const result = Actions[actionName]();
                if (result && typeof result.catch === "function") {
                    result.catch((error) => {
                        console.error(`UIX: Error while executing action "${actionName}":`, error);
                    });
                }
            }
            catch (error) {
                console.error(`UIX: Error while executing action "${actionName}":`, error);
            }
        }
    });
});
class Actions {
    static async clear_cache() {
        if (window.caches) {
            try {
                const cacheNames = await window.caches.keys();
                const deletePromises = [];
                cacheNames.forEach((cacheName) => {
                    deletePromises.push(window.caches.delete(cacheName));
                });
                await Promise.all(deletePromises);
                window.location.reload();
            }
            catch (error) {
                console.error("UIX: Failed to clear caches:", error);
                // Fallback: force a full reload even if cache clearing fails
                window.location.reload();
            }
        }
        else {
            window.location.reload();
        }
    }
}

/*
This file is copied from https://github.com/benlesh/event-target-polyfill and tweaked such that it never polyfills Event

MIT License

Copyright (c) 2020 Ben Lesh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const root =
  (typeof globalThis !== "undefined" && globalThis) ||
  (typeof self !== "undefined" && self) ||
  (typeof global !== "undefined" && global);

function isConstructor(fn) {
  try {
    new fn();
  } catch (error) {
    return false;
  }
  return true;
}

if (
  typeof root.EventTarget === "undefined" ||
  !isConstructor(root.EventTarget)
) {
  root.EventTarget = (function () {
    function EventTarget() {
      this.__listeners = new Map();
    }

    EventTarget.prototype = Object.create(Object.prototype);

    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      if (arguments.length < 2) {
        throw new TypeError(
          `TypeError: Failed to execute 'addEventListener' on 'EventTarget': 2 arguments required, but only ${arguments.length} present.`
        );
      }
      const __listeners = this.__listeners;
      const actualType = type.toString();
      if (!__listeners.has(actualType)) {
        __listeners.set(actualType, new Map());
      }
      const listenersForType = __listeners.get(actualType);
      if (!listenersForType.has(listener)) {
        // Any given listener is only registered once
        listenersForType.set(listener, options);
      }
    };

    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      _options
    ) {
      if (arguments.length < 2) {
        throw new TypeError(
          `TypeError: Failed to execute 'addEventListener' on 'EventTarget': 2 arguments required, but only ${arguments.length} present.`
        );
      }
      const __listeners = this.__listeners;
      const actualType = type.toString();
      if (__listeners.has(actualType)) {
        const listenersForType = __listeners.get(actualType);
        if (listenersForType.has(listener)) {
          listenersForType.delete(listener);
        }
      }
    };

    EventTarget.prototype.dispatchEvent = function (event) {
      if (!(event instanceof Event)) {
        throw new TypeError(
          `Failed to execute 'dispatchEvent' on 'EventTarget': parameter 1 is not of type 'Event'.`
        );
      }
      const type = event.type;
      const __listeners = this.__listeners;
      const listenersForType = __listeners.get(type);
      if (listenersForType) {
        for (const [listener, options] of listenersForType.entries()) {
          try {
            if (typeof listener === "function") {
              // Listener functions must be executed with the EventTarget as the `this` context.
              listener.call(this, event);
            } else if (listener && typeof listener.handleEvent === "function") {
              // Listener objects have their handleEvent method called, if they have one
              listener.handleEvent(event);
            }
          } catch (err) {
            // We need to report the error to the global error handling event,
            // but we do not want to break the loop that is executing the events.
            // Unfortunately, this is the best we can do, which isn't great, because the
            // native EventTarget will actually do this synchronously before moving to the next
            // event in the loop.
            setTimeout(() => {
              throw err;
            });
          }
          if (options && options.once) {
            // If this was registered with { once: true }, we need
            // to remove it now.
            listenersForType.delete(listener);
          }
        }
      }
      // Since there are no cancellable events on a base EventTarget,
      // this should always return true.
      return true;
    };

    return EventTarget;
  })();
}

var u$2;
const o$4 = /* @__PURE__ */ new WeakMap(), l$2 = () => {
}, n$4 = class n {
  constructor(s) {
    this.subscribers = [], this.settlement = null, this[u$2] = "Unpromise", typeof s == "function" ? this.promise = new Promise(s) : this.promise = s;
    const e = this.promise.then((t) => {
      const { subscribers: r } = this;
      this.subscribers = null, this.settlement = {
        status: "fulfilled",
        value: t
      }, r == null || r.forEach(({ resolve: c }) => {
        c(t);
      });
    });
    "catch" in e && e.catch((t) => {
      const { subscribers: r } = this;
      this.subscribers = null, this.settlement = {
        status: "rejected",
        reason: t
      }, r == null || r.forEach(({ reject: c }) => {
        c(t);
      });
    });
  }
  /** Create a promise that mitigates uncontrolled subscription to a long-lived
   * Promise via .then() and .catch() - otherwise a source of memory leaks.
   *
   * The returned promise has an `unsubscribe()` method which can be called when
   * the Promise is no longer being tracked by application logic, and which
   * ensures that there is no reference chain from the original promise to the
   * new one, and therefore no memory leak.
   *
   * If original promise has not yet settled, this adds a new unique promise
   * that listens to then/catch events, along with an `unsubscribe()` method to
   * detach it.
   *
   * If original promise has settled, then creates a new Promise.resolve() or
   * Promise.reject() and provided unsubscribe is a noop.
   *
   * If you call `unsubscribe()` before the returned Promise has settled, it
   * will never settle.
   */
  subscribe() {
    let s, e;
    const { settlement: t } = this;
    if (t === null) {
      if (this.subscribers === null)
        throw new Error("Unpromise settled but still has subscribers");
      const r = h$2();
      this.subscribers = f$2(this.subscribers, r), s = r.promise, e = () => {
        this.subscribers !== null && (this.subscribers = y$2(this.subscribers, r));
      };
    } else {
      const { status: r } = t;
      r === "fulfilled" ? s = Promise.resolve(t.value) : s = Promise.reject(t.reason), e = l$2;
    }
    return Object.assign(s, { unsubscribe: e });
  }
  /** STANDARD PROMISE METHODS (but returning a SubscribedPromise) */
  then(s, e) {
    const t = this.subscribe(), { unsubscribe: r } = t;
    return Object.assign(t.then(s, e), {
      unsubscribe: r
    });
  }
  catch(s) {
    const e = this.subscribe(), { unsubscribe: t } = e;
    return Object.assign(e.catch(s), {
      unsubscribe: t
    });
  }
  finally(s) {
    const e = this.subscribe(), { unsubscribe: t } = e;
    return Object.assign(e.finally(s), {
      unsubscribe: t
    });
  }
  /** Unpromise STATIC METHODS */
  /** Create or Retrieve the proxy Unpromise (a re-used Unpromise for the VM lifetime
   * of the provided Promise reference) */
  static proxy(s) {
    const e = n.getSubscribablePromise(s);
    return typeof e < "u" ? e : n.createSubscribablePromise(s);
  }
  /** Create and store an Unpromise keyed by an original Promise. */
  static createSubscribablePromise(s) {
    const e = new n(s);
    return o$4.set(s, e), o$4.set(e, e), e;
  }
  /** Retrieve a previously-created Unpromise keyed by an original Promise. */
  static getSubscribablePromise(s) {
    return o$4.get(s);
  }
  /** Promise STATIC METHODS */
  /** Lookup the Unpromise for this promise, and derive a SubscribedPromise from
   * it (that can be later unsubscribed to eliminate Memory leaks) */
  static resolve(s) {
    const e = typeof s == "object" && s !== null && "then" in s && typeof s.then == "function" ? s : Promise.resolve(s);
    return n.proxy(e).subscribe();
  }
  static async any(s) {
    const t = (Array.isArray(s) ? s : [...s]).map(n.resolve);
    try {
      return await Promise.any(t);
    } finally {
      t.forEach(({ unsubscribe: r }) => {
        r();
      });
    }
  }
  static async race(s) {
    const t = (Array.isArray(s) ? s : [...s]).map(n.resolve);
    try {
      return await Promise.race(t);
    } finally {
      t.forEach(({ unsubscribe: r }) => {
        r();
      });
    }
  }
  /** Create a race of SubscribedPromises that will fulfil to a single winning
   * Promise (in a 1-Tuple). Eliminates memory leaks from long-lived promises
   * accumulating .then() and .catch() subscribers. Allows simple logic to
   * consume the result, like...
   * ```ts
   * const [ winner ] = await Unpromise.race([ promiseA, promiseB ]);
   * if(winner === promiseB){
   *   const result = await promiseB;
   *   // do the thing
   * }
   * ```
   * */
  static async raceReferences(s) {
    const e = s.map(a$2);
    try {
      return await Promise.race(e);
    } finally {
      for (const t of e)
        t.unsubscribe();
    }
  }
};
u$2 = Symbol.toStringTag;
let b$1 = n$4;
function a$2(i) {
  return b$1.proxy(i).then(() => [i]);
}
function h$2() {
  let i, s;
  return {
    promise: new Promise((t, r) => {
      i = t, s = r;
    }),
    resolve: i,
    reject: s
  };
}
function f$2(i, s) {
  return [...i, s];
}
function m$1(i, s) {
  return [...i.slice(0, s), ...i.slice(s + 1)];
}
function y$2(i, s) {
  const e = i.indexOf(s);
  return e !== -1 ? m$1(i, e) : i;
}

async function hass_base_el() {
    await b$1.race([
        customElements.whenDefined("home-assistant"),
        customElements.whenDefined("hc-main"),
    ]);
    const element = customElements.get("home-assistant")
        ? "home-assistant"
        : "hc-main";
    while (!document.querySelector(element))
        await new Promise((r) => window.setTimeout(r, 100));
    return document.querySelector(element);
}
async function hass() {
    const base = await hass_base_el();
    while (!base.hass)
        await new Promise((r) => window.setTimeout(r, 100));
    return base.hass;
}
async function provideHass(el) {
    const base = await hass_base_el();
    base.provideHass(el);
}

const ConnectionMixin = (SuperClass) => {
    class UixConnection extends SuperClass {
        constructor() {
            super(...arguments);
            this.ready = false;
            this._connected = false;
            this.connectionPromise = new Promise((resolve) => {
                this._connectionResolve = resolve;
            });
            /*
             * Main state flags explained:
             * * `connected` and `disconnected` refers to WS connection,
             * * `ready` refers to established communication between browser and component counterpart.
             */
            // Component and frontend are mutually ready
            this.onReady = () => {
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
            };
            // WebSocket has connected
            this.onConnected = () => {
                this._connected = true;
                this.LOG("WebSocket connected");
            };
            // WebSocket has disconnected
            this.onDisconnected = () => {
                this.ready = false;
                this._connected = false;
                this.LOG("WebSocket disconnected");
                this.fireBrowserEvent("uix-disconnected");
            };
            this.onUserReady = () => {
                this.LOG("Hass user data ready");
                this.fireBrowserEvent("uix-user-ready");
            };
        }
        LOG(...args) {
            if (window.uix_log === undefined)
                return;
            const dt = new Date();
            console.log(`${dt.toLocaleTimeString()}`, ...args);
            if (this._connected) {
                try {
                    this.connection.sendMessage({
                        type: "uix/log",
                        message: args[0],
                    });
                }
                catch (err) {
                    console.log("UIX: Error sending log:", err);
                }
            }
        }
        // Propagate internal browser event
        fireBrowserEvent(event, detail = undefined) {
            this.dispatchEvent(new CustomEvent(event, { detail, bubbles: true }));
        }
        async userReady() {
            if (this.user) {
                return true;
            }
            else {
                let cnt = 0;
                while (!this.user && cnt++ < 20) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                if (this.user)
                    return true;
                throw new Error("User data not available after 10 seconds");
            }
        }
        // Handle incoming message
        incoming_message(msg) {
            var _a;
            // Set that have a connection. Allows logging
            if (!this._connected) {
                this.onConnected();
            }
            // Handle messages
            if (msg.command) {
                this.LOG("Command:", msg);
                this.fireBrowserEvent(`uix-command-${msg.command}`, msg);
            }
            else if (msg.result) {
                this.update_config(msg.result);
            }
            // Resolve first connection promise
            (_a = this._connectionResolve) === null || _a === void 0 ? void 0 : _a.call(this);
            this._connectionResolve = undefined;
        }
        update_config(cfg) {
            // Future update handling can be added here, for now just update config and fire event
            this._data = cfg;
            this.LOG("Receive:", cfg);
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
                var _a;
                if (((_a = haEvent.data) === null || _a === void 0 ? void 0 : _a.component) === "uix") {
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
            window.addEventListener("connection-status", (ev) => {
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
            var _a, _b;
            return (_b = (_a = this._data) === null || _a === void 0 ? void 0 : _a.config) !== null && _b !== void 0 ? _b : {};
        }
        get user() {
            var _a;
            return (_a = this.hass) === null || _a === void 0 ? void 0 : _a.user;
        }
        get version() {
            var _a;
            return (_a = this._data) === null || _a === void 0 ? void 0 : _a.version;
        }
    }
    return UixConnection;
};

var name = "uix";
var version = "5.0.0-beta.2";
var description = "UIX - UI eXtension for Home Assistant";
var scripts = {
	build: "rollup -c",
	"update-manifest-version": "node -e \"const pkg = require('./package.json'); const manifest = require('./custom_components/uix/manifest.json'); manifest.version = pkg.version; require('fs').writeFileSync('./custom_components/uix/manifest.json', JSON.stringify(manifest, null, 2) + '\\n');\"",
	prebuild: "npm run update-manifest-version",
	watch: "rollup -c --watch"
};
var keywords = [
];
var author = "Darryn Capes-Davis";
var license = "MIT";
var devDependencies = {
	"@babel/core": "^7.23.6",
	"@babel/preset-env": "^7.23.6",
	"@rollup/plugin-babel": "^6.0.4",
	"@rollup/plugin-json": "^6.1.0",
	"@rollup/plugin-node-resolve": "^15.2.3",
	"@semantic-release/changelog": "^6.0.3",
	"@semantic-release/exec": "^7.1.0",
	"@semantic-release/git": "^10.0.1",
	"conventional-changelog-conventionalcommits": "^9.1.0",
	rollup: "^2.79.2",
	"rollup-plugin-terser": "^7.0.2",
	"rollup-plugin-typescript2": "^0.36.0",
	"semantic-release": "^25.0.3",
	typescript: "^5.3.3"
};
var dependencies = {
	"@watchable/unpromise": "^1.0.2",
	lit: "^3.1.0",
	tslib: "^2.6.2"
};
var pjson = {
	name: name,
	"private": true,
	version: version,
	description: description,
	scripts: scripts,
	keywords: keywords,
	author: author,
	license: license,
	devDependencies: devDependencies,
	dependencies: dependencies
};

const TIMEOUT_ERROR = "SELECTTREE-TIMEOUT";
async function await_element(el, hard = false) {
    var _a;
    if ((_a = el.localName) === null || _a === void 0 ? void 0 : _a.includes("-"))
        await customElements.whenDefined(el.localName);
    if (el.updateComplete)
        await el.updateComplete;
    if (hard) {
        if (el.pageRendered)
            await el.pageRendered;
        if (el._panelState) {
            let rounds = 0;
            while (el._panelState !== "loaded" && rounds++ < 5)
                await new Promise((r) => setTimeout(r, 100));
        }
    }
}
async function _selectTree(root, path, all = false) {
    let el = [root];
    // Split and clean path
    if (typeof path === "string") {
        path = path.split(/(\$| )/);
    }
    while (path[path.length - 1] === "")
        path.pop();
    // For each element in the path
    for (const [i, p] of path.entries()) {
        if (p === "$") {
            await Promise.all([...el].map((e) => await_element(e)));
            el = [...el].map((e) => e.shadowRoot);
            continue;
        }
        // Only pick the first one for the next step
        const e = el[0];
        if (!e)
            return null;
        if (!p.trim().length)
            continue;
        await await_element(e);
        el = e.querySelectorAll(p);
    }
    return all ? el : el[0];
}
async function selectTree(root, path, all = false, timeout = 10000) {
    return b$1.race([
        _selectTree(root, path, all),
        new Promise((_, reject) => setTimeout(() => reject(new Error(TIMEOUT_ERROR)), timeout)),
    ]).catch((err) => {
        if (!err.message || err.message !== TIMEOUT_ERROR)
            throw err;
        return null;
    });
}

const VersionMixin = (SuperClass) => {
    return class VersionMixinClass extends SuperClass {
        constructor() {
            super();
            this._versionNotificationPending = false;
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
                    await this._localNotification(this.version, this._browserVersion);
                }
            }
        }
        async _localNotification(serverVersion, clientVersion) {
            // Wait for any other notifications to expire
            let haToast;
            do {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                haToast = await selectTree(document.body, "home-assistant $ notification-manager $ ha-toast", false, 1000);
            } while (haToast);
            const message = `UIX version mismatch! Browser: ${clientVersion}, Home Assistant: ${serverVersion}`;
            const action = {
                text: "Reload",
                action: () => Actions.clear_cache()
            };
            const base = await hass_base_el();
            base.dispatchEvent(new CustomEvent("hass-notification", {
                detail: {
                    message,
                    action: action,
                    duration: -1,
                    dismissable: true,
                },
            }));
        }
    };
};

class UixCoordinator extends VersionMixin(ConnectionMixin(EventTarget)) {
    constructor() {
        super();
        this.connect();
    }
}
window.addEventListener("uix-bootstrap", async (ev) => {
    ev.stopPropagation();
    if (!window.uixCoordinator) {
        window.uixCoordinator = new UixCoordinator();
    }
});

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;class n$3{constructor(t,e,o){if(this._$cssResult$=!0,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}}const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$1,defineProperty:e$1,getOwnPropertyDescriptor:r$3,getOwnPropertyNames:h$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$1(t,s),y$1={attribute:!0,type:String,converter:u$1,reflect:!1,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;class b extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=y$1){if(s.state&&(s.attribute=!1),this._$Ei(),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(t,i,s);void 0!==r&&e$1(this.prototype,t,r);}}static getPropertyDescriptor(t,s,i){const{get:e,set:h}=r$3(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get(){return e?.call(this)},set(s){const r=e?.call(this);h.call(this,s),this.requestUpdate(t,r,i);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??y$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...h$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return !1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev();}_$Ev(){this._$Eg=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$ES(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$E_??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$E_?.delete(t);}_$ES(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$E_?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$E_?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$EO(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==r?this.removeAttribute(e):this.setAttribute(e,r),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e,this[e]=r.fromAttribute(s,t.type),this._$Em=null;}}requestUpdate(t,s,i,e=!1,r){if(void 0!==t){if(i??=this.constructor.getPropertyOptions(t),!(i.hasChanged??f$1)(e?r:this[t],s))return;this.C(t,s,i);}!1===this.isUpdatePending&&(this._$Eg=this._$EP());}C(t,s,i){this._$AL.has(t)||this._$AL.set(t,s),!0===i.reflect&&this._$Em!==t&&(this._$Ej??=new Set).add(t);}async _$EP(){this.isUpdatePending=!0;try{await this._$Eg;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t)!0!==i.wrapped||this._$AL.has(s)||void 0===this[s]||this.C(s,this[s],i);}let t=!1;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$E_?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$ET();}catch(s){throw t=!1,this._$ET(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$E_?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$ET(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Eg}shouldUpdate(t){return !0}update(t){this._$Ej&&=this._$Ej.forEach((t=>this._$EO(t,this[t]))),this._$ET();}updated(t){}firstUpdated(t){}}b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[d$1("elementProperties")]=new Map,b[d$1("finalized")]=new Map,p$1?.({ReactiveElement:b}),(a$1.reactiveElementVersions??=[]).push("2.0.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.trustedTypes,s$1=i?i.createPolicy("lit-html",{createHTML:t=>t}):void 0,e="$lit$",h=`lit$${(Math.random()+"").slice(9)}$`,o$1="?"+h,n$1=`<${o$1}>`,r$2=document,l=()=>r$2.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),w=Symbol.for("lit-noChange"),T=Symbol.for("lit-nothing"),A=new WeakMap,E=r$2.createTreeWalker(r$2,129);function C(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const P=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n$1:d>=0?(o.push(a),s.slice(0,d)+e+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [C(t,l+(t[s]||"<?>")+(2===i?"</svg>":"")),o]};class V{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=P(t,s);if(this.el=V.createElement(f,n),E.currentNode=this.el.content,2===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=E.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?k:"?"===e[1]?H:"@"===e[1]?I:R}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i?i.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),E.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$1)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r$2.createElement("template");return s.innerHTML=t,s}}function N(t,i,s=t,e){if(i===w)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(!1),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=N(t,h._$AS(t,i.values),h,e)),i}class S{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$2).importNode(i,!0);E.currentNode=e;let h=E.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new M(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new L(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=E.nextNode(),o++);}return E.currentNode=r$2,e}p(t){let i=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class M{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=T,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??!0;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=N(this,t,i),c(t)?t===T||null==t||""===t?(this._$AH!==T&&this._$AR(),this._$AH=T):t!==this._$AH&&t!==w&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):u(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==T&&c(this._$AH)?this._$AA.nextSibling.data=t:this.$(r$2.createTextNode(t)),this._$AH=t;}g(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=V.createElement(C(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new S(e,this),s=t.u(this.options);t.p(i),this.$(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new V(t)),i}T(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new M(this.k(l()),this.k(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class R{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=T,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=T;}_$AI(t,i=this,s,e){const h=this.strings;let o=!1;if(void 0===h)t=N(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==w,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=N(this,e[s+n],i,n),r===w&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===T?t=T:t!==T&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.O(t);}O(t){t===T?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class k extends R{constructor(){super(...arguments),this.type=3;}O(t){this.element[this.name]=t===T?void 0:t;}}class H extends R{constructor(){super(...arguments),this.type=4;}O(t){this.element.toggleAttribute(this.name,!!t&&t!==T);}}class I extends R{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=N(this,t,i,0)??T)===w)return;const s=this._$AH,e=t===T&&s!==T||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==T&&(s===T||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class L{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){N(this,t);}}const Z=t.litHtmlPolyfillSupport;Z?.(V,M),(t.litHtmlVersions??=[]).push("3.1.0");const j=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new M(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class s extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=j(i,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1);}render(){return w}}s._$litElement$=!0,s[("finalized")]=!0,globalThis.litElementHydrateSupport?.({LitElement:s});const r$1=globalThis.litElementPolyfillSupport;r$1?.({LitElement:s});(globalThis.litElementVersions??=[]).push("4.0.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:!0,type:String,converter:u$1,reflect:!1,hasChanged:f$1},r=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.C(o,void 0,t),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,r?{...t,wrapped:!0}:t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

const ID_STORAGE_KEY = "browser_mod-browser-id";
function BrowserID() {
    if (document.querySelector("hc-main"))
        return "CAST";
    if (localStorage[ID_STORAGE_KEY])
        return localStorage[ID_STORAGE_KEY];
    return "";
}

var PanelState = null;
async function _getPanel(document) {
    let _panel = await _getPanel(document);
    while (_panel === null) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        _panel = await _getPanel(document);
    }
    return _panel;
    async function _getPanel(document) {
        let panel = await selectTree(document, "home-assistant $ home-assistant-main $ partial-panel-resolver>*");
        if (!panel) {
            panel = await selectTree(document, "hc-main $ hc-lovelace");
        }
        if (!panel) {
            panel = await selectTree(document, "hc-main $ hc-lovelace");
        }
        return panel;
    }
}
function _getPanelNameTranslationKey(panel) {
    if ((panel === null || panel === void 0 ? void 0 : panel.url_path) === "lovelace") {
        return "panel.states";
    }
    if ((panel === null || panel === void 0 ? void 0 : panel.url_path) === "profile") {
        return "panel.profile";
    }
    return `panel.${panel === null || panel === void 0 ? void 0 : panel.title}`;
}
function _panelTitle(panel) {
    var _a, _b, _c;
    if ((_a = panel === null || panel === void 0 ? void 0 : panel.hass) === null || _a === void 0 ? void 0 : _a.localize) {
        const translationKey = _getPanelNameTranslationKey(panel.panel);
        return panel.hass.localize(translationKey) || ((_b = panel.panel) === null || _b === void 0 ? void 0 : _b.title) || "";
    }
    return ((_c = panel === null || panel === void 0 ? void 0 : panel.panel) === null || _c === void 0 ? void 0 : _c.title) || "";
}
function _panelAttributes(panel) {
    var _a, _b, _c, _d, _e;
    return {
        panelTitle: _panelTitle(panel),
        panelUrlPath: ((_b = (_a = panel === null || panel === void 0 ? void 0 : panel.route) === null || _a === void 0 ? void 0 : _a.prefix) === null || _b === void 0 ? void 0 : _b.replace(/^\/|\/$/g, "")) || "",
        panelComponentName: ((_c = panel === null || panel === void 0 ? void 0 : panel.panel) === null || _c === void 0 ? void 0 : _c.component_name) || "",
        panelIcon: ((_d = panel === null || panel === void 0 ? void 0 : panel.panel) === null || _d === void 0 ? void 0 : _d.icon) || "",
        panelNarrow: (panel === null || panel === void 0 ? void 0 : panel.narrow) || false,
        panelRequireAdmin: ((_e = panel === null || panel === void 0 ? void 0 : panel.panel) === null || _e === void 0 ? void 0 : _e.require_admin) || false,
    };
}
async function _viewAttributes(panel) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (((_a = panel === null || panel === void 0 ? void 0 : panel.panel) === null || _a === void 0 ? void 0 : _a.component_name) !== "lovelace") {
        return {
            viewTitle: "",
            viewUrlPath: ((_c = (_b = panel === null || panel === void 0 ? void 0 : panel.route) === null || _b === void 0 ? void 0 : _b.path) === null || _c === void 0 ? void 0 : _c.replace(/^\/|\/$/g, "")) || "",
            viewNarrow: (panel === null || panel === void 0 ? void 0 : panel.narrow) || false,
        };
    }
    let cnt = 0;
    while (!((_d = panel.shadowRoot) === null || _d === void 0 ? void 0 : _d.querySelector("hui-root")) && cnt < 100) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        cnt++;
    }
    const lovelace = panel.shadowRoot.querySelector("hui-root");
    if (!lovelace)
        return {};
    const _curView = lovelace._curView || 0;
    return {
        viewTitle: ((_g = (_f = (_e = lovelace.config) === null || _e === void 0 ? void 0 : _e.views) === null || _f === void 0 ? void 0 : _f[_curView]) === null || _g === void 0 ? void 0 : _g.title) || "",
        viewUrlPath: ((_k = (_j = (_h = lovelace.config) === null || _h === void 0 ? void 0 : _h.views) === null || _j === void 0 ? void 0 : _j[_curView]) === null || _k === void 0 ? void 0 : _k.path) || `${_curView}`,
        viewNarrow: lovelace.narrow || false,
    };
}
async function _current_panel_state() {
    const panel = await _getPanel(document);
    const panelAttributes = _panelAttributes(panel);
    const viewAttributes = await _viewAttributes(panel);
    const fullTitle = [];
    if (panelAttributes.panelTitle) {
        fullTitle.push(panelAttributes.panelTitle);
    }
    if (viewAttributes.viewTitle) {
        fullTitle.push(viewAttributes.viewTitle);
    }
    const fullUrlPath = [];
    if (panelAttributes.panelUrlPath) {
        fullUrlPath.push(panelAttributes.panelUrlPath);
    }
    if (viewAttributes.viewUrlPath) {
        fullUrlPath.push(viewAttributes.viewUrlPath);
    }
    return {
        hash: location.hash.substr(1) || "",
        panel: Object.assign(Object.assign({ title: fullTitle.join(" - "), fullUrlPath: fullUrlPath.join("/") }, panelAttributes), viewAttributes),
    };
}
function _panel_state_update() {
    const update = async () => {
        var panelState = await _current_panel_state();
        var browserPath = window.location.pathname.slice(1).toLowerCase();
        var panelPath = panelState.panel.fullUrlPath.toLowerCase();
        let retry = 0;
        while (browserPath !== panelPath && retry++ < 200) {
            await new Promise((resolve) => setTimeout(resolve, 10));
            panelState = await _current_panel_state();
            browserPath = window.location.pathname.slice(1).toLowerCase();
            panelPath = panelState.panel.fullUrlPath.toLowerCase();
        }
        if (browserPath !== panelPath) {
            console.groupCollapsed("UIX: cannot resolve Panel information after 2s.");
            console.log("Browser path:", browserPath);
            console.log("Panel path:", panelPath);
            console.log("Final panel state:", panelState);
            console.groupEnd();
        }
        return panelState;
    };
    PanelState = new Promise((resolve) => resolve(update()));
}
function getPanelState() {
    if (!PanelState) {
        _panel_state_update();
    }
    return PanelState;
}
window.addEventListener("uix-bootstrap", async (ev) => {
    ev.stopPropagation();
    ["popstate", "location-changed"].forEach((event) => {
        window.addEventListener(event, async () => {
            PanelState = null;
            _panel_state_update();
            PanelState.then(() => {
                document.dispatchEvent(new CustomEvent("uix_update", { detail: { variablesChanged: true } }));
            });
        });
    });
});

window.uix_template_cache =
    window.uix_template_cache || {};
const cachedTemplates = window
    .uix_template_cache;
function template_updated(key, result) {
    const cache = cachedTemplates[key];
    if (!cache) {
        return;
    }
    if ("error" in result) {
        cache.error = result;
        cache.value = "";
        if (cache.debug) {
            console.groupCollapsed(`UIX: Template ${cache.error.level}`);
            console.log({
                template: cache.template,
                variables: cache.variables,
                value: cache.value,
                error: cache.error
            });
            console.groupEnd();
        }
    }
    else {
        cache.value = result.result;
        if (cache.debug) {
            console.groupCollapsed("UIX: Template updated");
            console.log({
                template: cache.template,
                variables: cache.variables,
                value: cache.value,
                error: cache.error
            });
            console.groupEnd();
        }
    }
    cache.callbacks.forEach((f) => f(cache.value));
}
function hasTemplate(str) {
    if (!str)
        return false;
    return String(str).includes("{%") || String(str).includes("{{");
}
async function bind_template(callback, template, variables) {
    const hs = await hass();
    const panelState = await getPanelState();
    const connection = hs.connection;
    variables = Object.assign(Object.assign({ user: hs.user.name, browser: BrowserID() }, panelState), variables);
    const cacheKey = JSON.stringify([template, variables]);
    let cache = cachedTemplates[cacheKey];
    if (!cache) {
        let debug = false;
        unbind_template(callback);
        callback("");
        if (template.includes("uix.debug") || template.includes("card_mod.debug")) {
            debug = true;
            console.groupCollapsed("UIX: Binding template");
            console.log({
                template,
                variables
            });
            console.groupEnd();
        }
        cachedTemplates[cacheKey] = cache = {
            template,
            variables,
            value: "",
            callbacks: new Set([callback]),
            debug,
            unsubscribe: connection.subscribeMessage((result) => template_updated(cacheKey, result), {
                type: "render_template",
                template,
                variables,
                report_errors: debug,
            }),
        };
    }
    else {
        if (cache.debug) {
            console.groupCollapsed("UIX: Reusing template");
            console.log({
                template: cache.template,
                variables: cache.variables,
                value: cache.value,
                error: cache.error
            });
            console.groupEnd();
        }
        if (!cache.callbacks.has(callback))
            unbind_template(callback);
        callback(cache.value);
        cache.callbacks.add(callback);
        cache.cooldownTimeoutID && clearTimeout(cache.cooldownTimeoutID);
        cache.cooldownTimeoutID = undefined;
    }
}
async function unbind_template(callback) {
    for (const [key, cache] of Object.entries(cachedTemplates)) {
        if (cache.callbacks.has(callback)) {
            cache.callbacks.delete(callback);
            if (cache.callbacks.size == 0) {
                if (cache.debug) {
                    console.groupCollapsed("UIX: Template unbound and will be unsubscribed after cooldown");
                    console.log({
                        template: cache.template,
                        variables: cache.variables
                    });
                    console.groupEnd();
                }
                cache.cooldownTimeoutID = window.setTimeout(unsubscribe_template, 20000, key);
            }
            break;
        }
    }
}
async function unsubscribe_template(key) {
    const cache = cachedTemplates[key];
    if (!cache)
        return;
    if (cache.cooldownTimeoutID) {
        clearTimeout(cache.cooldownTimeoutID);
    }
    if (cache.debug) {
        console.groupCollapsed("UIX: Unsubscribing template after cooldown");
        console.log({
            template: cache.template,
            variables: cache.variables
        });
        console.groupEnd();
    }
    delete cachedTemplates[key];
    await (await cache.unsubscribe)();
}

const _load_yaml2json = async () => {
    var _a;
    if (customElements.get("developer-tools-event"))
        return;
    try {
        await customElements.whenDefined("partial-panel-resolver");
        const ppr = document.createElement("partial-panel-resolver");
        ppr.hass = {
            panels: [
                {
                    url_path: "tmp",
                    component_name: "config",
                },
            ],
        };
        ppr._updateRoutes();
        await ppr.routerOptions.routes.tmp.load();
        await customElements.whenDefined("ha-panel-config");
        const hpc = document.createElement("ha-panel-config");
        await ((_a = hpc.routerOptions.routes['developer-tools']) === null || _a === void 0 ? void 0 : _a.load());
        await customElements.whenDefined("developer-tools-router");
        const dtr = document.createElement("developer-tools-router");
        await dtr.routerOptions.routes.event.load();
    }
    catch (err) {
        console.error("CARD-MOD: Error loading yaml2json:", err);
    }
};
const yaml2json = async (yaml) => {
    await _load_yaml2json();
    const el = document.createElement("ha-yaml-editor");
    el.hass = {};
    el.hass.localize = (any) => "Invalid YAML";
    el._onChange(new CustomEvent("yaml", { detail: { value: yaml } }));
    if (!el.isValid) {
        console.error("CARD-MOD: Error loading theme yaml:", yaml);
        return {};
    }
    return el.value;
};

function refresh_theme() {
    document.dispatchEvent(new Event("uix_update"));
}
const bases = [
    customElements.whenDefined("home-assistant"),
    customElements.whenDefined("hc-main"),
];
b$1.race(bases).then(() => {
    window.setTimeout(async () => {
        var _a, _b;
        const hs = await hass();
        while (!hs) {
            await new Promise((resolve) => window.setTimeout(resolve, 500));
        }
        hs.connection.subscribeEvents(() => {
            window.setTimeout(refresh_theme, 500);
        }, "themes_updated");
        (_a = document
            .querySelector("home-assistant")) === null || _a === void 0 ? void 0 : _a.addEventListener("settheme", refresh_theme);
        (_b = document
            .querySelector("hc-main")) === null || _b === void 0 ? void 0 : _b.addEventListener("settheme", refresh_theme);
    }, 1000);
});
function themesReady() {
    function _themesReady(hass) {
        // Themes are ready when themes exist and a theme is selected
        return (hass === null || hass === void 0 ? void 0 : hass.themes) && (hass === null || hass === void 0 ? void 0 : hass.themes.themes) && (hass === null || hass === void 0 ? void 0 : hass.themes.theme);
    }
    return new Promise((resolve, reject) => {
        let settled = false;
        (async () => {
            const hs = await hass();
            if (_themesReady(hs)) {
                settled = true;
                resolve();
                return;
            }
            const id = window.setInterval(async () => {
                const hs = await hass();
                if (_themesReady(hs)) {
                    if (!settled) {
                        settled = true;
                        clearInterval(id);
                        clearTimeout(timeoutId);
                        resolve();
                    }
                }
            }, 500);
            const timeoutId = window.setTimeout(() => {
                if (!settled) {
                    settled = true;
                    clearInterval(id);
                    reject(new Error("UIX: themesReady: Timeout waiting for themes to become ready"));
                }
            }, 30000); // 30 seconds
        })();
    });
}

function cssValueIsTrue(v) {
    if (!v)
        return false;
    const t = v.trim().toLowerCase();
    return t === "true" || t === "1" || t === "yes" || t === "on";
}
async function get_theme(root) {
    var _a;
    if (!root.type)
        return null;
    await themesReady();
    const el = root.parentElement ? root.parentElement : root;
    const cs = window.getComputedStyle(el);
    const theme = cs.getPropertyPriority("--uix-theme") || cs.getPropertyValue("--card-mod-theme");
    // Determine debug flag from CSS variables.
    // Checked patterns:
    //  - --uix-<type>-debug
    //  - --uix-<type>-<class>-debug
    let debug = false;
    const typeDebug = cs.getPropertyValue(`--uix-${root.type}-debug`) || cs.getPropertyValue(`--card-mod-${root.type}-debug`);
    if (cssValueIsTrue(typeDebug))
        debug = true;
    for (const cls of root.classes) {
        const debugVar = cs.getPropertyValue(`--uix-${root.type}-${cls}-debug`) || cs.getPropertyValue(`--card-mod-${root.type}-${cls}-debug`);
        if (cssValueIsTrue(debugVar)) {
            debug = true;
            break;
        }
    }
    root.debug || (root.debug = !!debug);
    root.debug && console.log("UIX Debug: Theme:", theme);
    const hs = await hass();
    if (!hs)
        return {};
    const themes = (_a = hs === null || hs === void 0 ? void 0 : hs.themes.themes) !== null && _a !== void 0 ? _a : {};
    if (!themes[theme])
        return {};
    if (themes[theme][`uix-${root.type}-yaml`]) {
        return yaml2json(themes[theme][`uix-${root.type}-yaml`]);
    }
    else if (themes[theme][`card-mod-${root.type}-yaml`]) {
        return yaml2json(themes[theme][`card-mod-${root.type}-yaml`]);
    }
    else if (themes[theme][`uix-${root.type}`]) {
        return { ".": themes[theme][`uix-${root.type}`] };
    }
    else if (themes[theme][`card-mod-${root.type}`]) {
        return { ".": themes[theme][`card-mod-${root.type}`] };
    }
    else {
        return {};
    }
}

class ModdedElement extends s {
    constructor() {
        super(...arguments);
        this._uix = [];
    }
    setConfig(_orig, config, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(config, ...args);
        this._uix.forEach((uix) => {
            var _a, _b;
            uix.variables = { config };
            uix.styles = ((_a = config.uix) === null || _a === void 0 ? void 0 : _a.style) || ((_b = config.card_mod) === null || _b === void 0 ? void 0 : _b.style) || {};
        });
    }
    updated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        Promise.all([this.updateComplete]).then(() => this._uix.forEach((uix) => { var _a; return (_a = uix.refresh) === null || _a === void 0 ? void 0 : _a.call(uix); }));
    }
}
async function apply_uix_compatible(element, type, uix_config = undefined, // or styles
variables = {}, shadow = true, // or deprecated
cls = undefined // or shadow
) {
    // TODO: Remove ????
    // This is for backwards compatibility with Card mod version 3.3 and earlier.
    var _a, _b;
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
    if (uix_config &&
        Object.keys(uix_config).length !== 0 &&
        ((_b = (_a = uix_config === null || uix_config === void 0 ? void 0 : uix_config.style) !== null && _a !== void 0 ? _a : uix_config === null || uix_config === void 0 ? void 0 : uix_config.class) !== null && _b !== void 0 ? _b : uix_config === null || uix_config === void 0 ? void 0 : uix_config.debug) === undefined) {
        // Old style call with object styles
        uix_config = { style: uix_config };
        oldStyle = true;
    }
    if (oldStyle && !window.uix_compatibility_warning) {
        window.uix_compatibility_warning = true;
        console.groupCollapsed("UIX warning");
        console.info("You are using a custom card which relies on UIX, and uses an outdated signature for applyToElement.");
        console.info("The outdated signature will be removed at some point in the future. Hopefully the developer of your card will have updated their card by then.");
        console.info("The card used UIX to apply styles here:", element);
        console.groupEnd();
    }
    return apply_uix(element, type, uix_config, variables, shadow, cls);
}
async function apply_uix(element, type, uix_config = undefined, variables = {}, shadow = true, cls = undefined) {
    var _a, _b, _c, _d, _e, _f, _g;
    const debug = (uix_config === null || uix_config === void 0 ? void 0 : uix_config.debug)
        ? (...msg) => console.log("UIX Debug:", ...msg)
        : (...msg) => { };
    debug("Applying UIX to:", ...((element === null || element === void 0 ? void 0 : element.host)
        ? ["#shadow-root of:", element === null || element === void 0 ? void 0 : element.host]
        : [element]), "type: ", type, "configuration: ", uix_config);
    if (!element)
        return;
    // Wait for target element to exist
    if ((_a = element.localName) === null || _a === void 0 ? void 0 : _a.includes("-"))
        await customElements.whenDefined(element.localName);
    element._uix = element._uix || [];
    // Await uix-node element definition
    if (!customElements.get("uix-node")) {
        debug("Waiting for uix-node customElement to be defined");
        await customElements.whenDefined("uix-node");
    }
    // Find any existing uix-node elements of the right type
    const uix = (_b = element._uix.find((uix) => uix.type === type)) !== null && _b !== void 0 ? _b : document.createElement("uix-node");
    debug("Applying UIX in:", uix);
    uix.type = type;
    uix.uix_class = cls;
    uix.debug = (_c = uix_config === null || uix_config === void 0 ? void 0 : uix_config.debug) !== null && _c !== void 0 ? _c : false;
    uix.cancelStyleChild();
    if (!element._uix.includes(uix))
        element._uix.push(uix);
    window.setTimeout(async () => {
        var _a, _b, _c, _d;
        await Promise.all([element.updateComplete]);
        const target = ((_a = element.modElement) !== null && _a !== void 0 ? _a : shadow) ? (_b = element.shadowRoot) !== null && _b !== void 0 ? _b : element : element;
        if (!target.contains(uix)) {
            // Prepend if set or if Lit is in a buggy state
            const litWorkaround = ((_c = element === null || element === void 0 ? void 0 : element.renderOptions) === null || _c === void 0 ? void 0 : _c.renderBefore) === null;
            if (litWorkaround)
                debug("Lit prepend workaround applied for:", element);
            if ((uix_config === null || uix_config === void 0 ? void 0 : uix_config.prepend) || litWorkaround) {
                target.prepend(uix);
            }
            else {
                target.appendChild(uix);
            }
        }
        uix.variables = variables;
        uix.styles = (_d = uix_config === null || uix_config === void 0 ? void 0 : uix_config.style) !== null && _d !== void 0 ? _d : "";
    }, 1);
    uix.classes =
        typeof (uix_config === null || uix_config === void 0 ? void 0 : uix_config.class) == "string"
            ? (_e = (_d = uix_config === null || uix_config === void 0 ? void 0 : uix_config.class) === null || _d === void 0 ? void 0 : _d.split) === null || _e === void 0 ? void 0 : _e.call(_d, " ")
            : [...((_f = uix_config === null || uix_config === void 0 ? void 0 : uix_config.class) !== null && _f !== void 0 ? _f : [])];
    cls && uix.classes.push(cls);
    (_g = element.classList) === null || _g === void 0 ? void 0 : _g.add(...uix.classes);
    return uix;
}

function merge_deep(target, source) {
    const isObject = (i) => {
        return i && typeof i === "object" && !Array.isArray(i);
    };
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                if (typeof target[key] === "string")
                    target[key] = { ".": target[key] };
                merge_deep(target[key], source[key]);
            }
            else {
                if (target[key])
                    target[key] = source[key] + target[key];
                else
                    target[key] = source[key];
            }
        }
    }
    return target;
}
function compare_deep(a, b) {
    if (a === b)
        return true;
    if (typeof a !== typeof b)
        return false;
    if (!(a instanceof Object && b instanceof Object))
        return false;
    for (const x in a) {
        if (!a.hasOwnProperty(x))
            continue;
        if (!b.hasOwnProperty(x))
            return false;
        if (a[x] === b[x])
            continue;
        if (typeof a[x] !== "object")
            return false;
        if (!compare_deep(a[x], b[x]))
            return false;
    }
    for (const x in b) {
        if (!b.hasOwnProperty(x))
            continue;
        if (!a.hasOwnProperty(x))
            return false;
    }
    return true;
}

class Uix extends s {
    static get applyToElement() {
        // This gets the compatibility wrapper for backwards compatibility with uix 3.3.
        // The wrapper should be removed at earliest June 2024, or if uix 4.0 is released
        return apply_uix_compatible;
    }
    constructor() {
        super();
        this.dynamicVariablesHaveChanged = false;
        this.uix_children = {};
        this.uix_parent = undefined;
        this.uix_class = undefined;
        this.classes = [];
        this.debug = false;
        this._fixed_styles = {};
        this._styles = "";
        this._processStylesOnConnect = false;
        this._rendered_styles = "";
        this._cancel_style_child = [];
        this._observer = new MutationObserver((mutations) => {
            // MutationObserver to keep track of any changes to the parent element
            // e.g. when elements are changed after creation.
            // The observer is activated in _connect() only if there are any styles
            //  which should be applied to children
            if (this.debug) {
                this._debug("Mutations observed:", mutations);
            }
            let stop = true;
            for (const m of mutations) {
                if (m.target.localName === "uix-node")
                    return;
                if (m.addedNodes.length)
                    m.addedNodes.forEach((n) => {
                        if (n.localName !== "uix-node")
                            stop = false;
                    });
                if (m.removedNodes.length)
                    m.removedNodes.forEach((n) => {
                        if (n.localName !== "uix-node")
                            stop = false;
                    });
            }
            if (stop)
                return;
            this.refresh();
        });
        // uix_update is issued when themes are reloaded
        document.addEventListener("uix_update", (ev) => {
            var _a;
            // Don't process disconnected elements
            this.dynamicVariablesHaveChanged = ((_a = ev.detail) === null || _a === void 0 ? void 0 : _a.variablesChanged) || false;
            if (!this.isConnected) {
                this._processStylesOnConnect = true;
                return;
            }
            this._process_styles(this.uix_input);
        });
    }
    connectedCallback() {
        var _a, _b, _c;
        super.connectedCallback();
        if (this._processStylesOnConnect) {
            this._processStylesOnConnect = false;
            this._debug("Processing styles on (Re)connect:", "type:", this.type, "for:", ...(((_a = this === null || this === void 0 ? void 0 : this.parentNode) === null || _a === void 0 ? void 0 : _a.host)
                ? ["#shadow-root of:", (_b = this === null || this === void 0 ? void 0 : this.parentNode) === null || _b === void 0 ? void 0 : _b.host]
                : [(_c = this.parentElement) !== null && _c !== void 0 ? _c : this.parentNode]));
            this._process_styles(this.uix_input);
        }
        else {
            this.refresh();
        }
        // Make sure the uix element is invisible
        this.setAttribute("slot", "none");
        this.style.display = "none";
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._disconnect();
    }
    set styles(stl) {
        // Parsing styles is expensive, so only do it if things have actually changed
        if (compare_deep(stl, this.uix_input))
            return;
        this.uix_input = stl;
        if (!this.isConnected) {
            this._processStylesOnConnect = true;
            return;
        }
        this._process_styles(stl);
    }
    get styles() {
        // Return only styles that apply to this element
        return this._styles;
    }
    refresh() {
        this._connect();
    }
    cancelStyleChild() {
        this._cancel_style_child.forEach((cancel) => cancel());
        this._cancel_style_child = [];
    }
    _debug(...msg) {
        if (this.debug)
            console.log("UIX Debug:", ...msg);
    }
    async _process_styles(stl) {
        let styles = typeof stl === "string" || stl === undefined ? { ".": stl !== null && stl !== void 0 ? stl : "" } : JSON.parse(JSON.stringify(stl));
        // Merge uix styles with theme styles
        const theme_styles = await get_theme(this);
        merge_deep(styles, theme_styles);
        // Save processed styles
        this._fixed_styles = styles;
        this.refresh();
    }
    async _style_child(path, style, retries = 0) {
        const parent = this.parentElement || this.parentNode;
        const elements = await selectTree(parent, path, true);
        if (!elements || !elements.length) {
            if (retries > 5)
                throw new Error("NoElements");
            let timeout = new Promise((resolve, reject) => {
                setTimeout(resolve, retries * 100);
                this._cancel_style_child.push(reject);
            });
            await timeout.catch((e) => {
                throw new Error("Cancelled");
            });
            return this._style_child(path, style, retries + 1);
        }
        return [...elements].map(async (ch) => {
            const uix = await apply_uix(ch, `${this.type}-child`, { style, debug: this.debug }, this.variables, false);
            if (uix)
                uix.uix_parent = this;
            return uix;
        });
    }
    async _connect() {
        var _a, _b, _c, _d, _e, _f;
        const styles = (_a = this._fixed_styles) !== null && _a !== void 0 ? _a : {};
        const styleChildren = {};
        let thisStyle = "";
        let hasChildren = false;
        this._debug("(Re)connecting:", "type:", this.type, "to:", ...(((_b = this === null || this === void 0 ? void 0 : this.parentNode) === null || _b === void 0 ? void 0 : _b.host)
            ? ["#shadow-root of:", (_c = this === null || this === void 0 ? void 0 : this.parentNode) === null || _c === void 0 ? void 0 : _c.host]
            : [(_d = this.parentElement) !== null && _d !== void 0 ? _d : this.parentNode]));
        this.cancelStyleChild();
        // Go through each path in the styles
        for (const [key, value] of Object.entries(styles)) {
            if (key === ".") {
                if (typeof value === "string")
                    thisStyle = value;
                else
                    this._debug("Style of '.' must be a string: ", value);
            }
            else {
                hasChildren = true;
                styleChildren[key] = this._style_child(key, value).catch((e) => {
                    if (e.message == "NoElements") {
                        if (this.debug) {
                            console.groupCollapsed("UIX found no elements");
                            console.info(`Looked for ${key}`);
                            console.info(this);
                            console.groupEnd();
                        }
                        return;
                    }
                    if (e.message == "Cancelled") {
                        if (this.debug) {
                            console.groupCollapsed("UIX style_child cancelled while looking for elements");
                            console.info(`Looked for ${key}`);
                            console.info(this);
                            console.groupEnd();
                        }
                        return;
                    }
                    throw e;
                });
            }
        }
        // Prune old child elements
        for (const key in this.uix_children) {
            if (!styleChildren[key]) {
                (_e = (await this.uix_children[key])) === null || _e === void 0 ? void 0 : _e.forEach(async (ch) => await ch.then((uix) => (uix.styles = "")).catch(() => { }));
            }
        }
        this.uix_children = styleChildren;
        if (hasChildren) {
            this._observer.disconnect();
            const parentEl = (_f = this.parentElement) !== null && _f !== void 0 ? _f : this.parentNode;
            if (parentEl) {
                // Observe changes to the parent element to catch any changes
                if (this.debug) {
                    this._debug("Observing for changes on:", parentEl);
                }
                this._observer.observe(parentEl, {
                    childList: true,
                });
                if (parentEl.host) {
                    // If parent is a shadow root, also observe changes to the host
                    if (this.debug) {
                        this._debug("Observing for changes on:", parentEl.host);
                    }
                    this._observer.observe(parentEl.host, {
                        childList: true,
                    });
                }
            }
        }
        // Process styles applicable to this card-mod element
        if (this._styles === thisStyle && !this.dynamicVariablesHaveChanged)
            return;
        this._styles = thisStyle;
        this.dynamicVariablesHaveChanged = false;
        if (hasTemplate(this._styles)) {
            this._renderer = this._renderer || this._style_rendered.bind(this);
            bind_template(this._renderer, this._styles, this.variables);
        }
        else {
            this._style_rendered(this._styles || "");
        }
    }
    async _disconnect() {
        var _a, _b;
        this._observer.disconnect();
        this._styles = "";
        this.cancelStyleChild();
        await unbind_template(this._renderer);
        (_b = (_a = this.uix_parent) === null || _a === void 0 ? void 0 : _a.refresh) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    _style_rendered(result) {
        if (this._rendered_styles !== result)
            this._rendered_styles = result;
        // This event is listened for by icons
        this.dispatchEvent(new Event("uix-styles-update"));
    }
    createRenderRoot() {
        return this;
    }
    render() {
        return x `
      <style>
        ${this._rendered_styles}
      </style>
    `;
    }
}
__decorate([
    n({ attribute: "uix-type", reflect: true })
], Uix.prototype, "type", void 0);
__decorate([
    n()
], Uix.prototype, "_rendered_styles", void 0);
if (!customElements.get("uix-node")) {
    customElements.define("uix-node", Uix);
    console.groupCollapsed(`%c💡 UIX ${pjson.version} IS INSTALLED 💡`, 'color: white; background-color: #CE3226; padding: 2px 5px; font-weight: bold; border-radius: 5px;');
    console.log('Documentation:', 'https://uix.lf.technology/');
    console.groupEnd();
    window.dispatchEvent(new Event("uix-bootstrap"));
}
(async () => {
    // Wait for scoped customElements registry to be set up
    // and then redefine uix-node if necessary
    // otherwise the customElements registry uix-node is defined in
    // may get overwritten by the polyfill if uix-node is loaded as a module
    while (customElements.get("home-assistant") === undefined)
        await new Promise((resolve) => window.setTimeout(resolve, 100));
    if (!customElements.get("uix-node")) {
        customElements.define("uix-node", Uix);
    }
})();

window.uix_patch_state = window.uix_patch_state || {};
const patchState = window.uix_patch_state;
const cardModPatchState = window.card_mod_patch_state;
const patch_method = function (obj, method, override) {
    if (method === "constructor")
        return;
    const original = obj[method];
    const fn = function (...args) {
        try {
            return override.call(this, original === null || original === void 0 ? void 0 : original.bind(this), ...args);
        }
        catch (e) {
            return original === null || original === void 0 ? void 0 : original.bind(this)(...args);
        }
    };
    obj[method] = fn;
};
const set_patched = (element) => {
    const key = typeof element === "string" ? element : element.constructor.name;
    patchState[key] = { patched: true, version: pjson.version };
};
const is_patched = (element) => {
    var _a, _b, _c;
    const key = typeof element === "string" ? element : element.constructor.name;
    return (_c = (_b = (_a = patchState[key]) === null || _a === void 0 ? void 0 : _a.patched) !== null && _b !== void 0 ? _b : patchState[key]) !== null && _c !== void 0 ? _c : false;
};
const patch_object = (obj, patch) => {
    if (!obj)
        return;
    for (const method in Object.getOwnPropertyDescriptors(patch.prototype)) {
        patch_method(obj, method, patch.prototype[method]);
    }
};
const patch_prototype = async (cls, patch, afterwards) => {
    if (typeof cls === "string") {
        await customElements.whenDefined(cls);
        cls = customElements.get(cls);
    }
    const patched = patch_object(cls.prototype, patch);
    afterwards === null || afterwards === void 0 ? void 0 : afterwards();
    return patched;
};
// Decorator for patching a custom-element
function patch_element(element, afterwards) {
    return function patched(constructor) {
        var _a, _b, _c, _d, _e, _f;
        const key = typeof element === "string" ? element : element.name;
        const patched = (_c = (_b = (_a = patchState[key]) === null || _a === void 0 ? void 0 : _a.patched) !== null && _b !== void 0 ? _b : patchState[key]) !== null && _c !== void 0 ? _c : false;
        const cardModPatched = (_f = (_e = (_d = cardModPatchState === null || cardModPatchState === void 0 ? void 0 : cardModPatchState[key]) === null || _d === void 0 ? void 0 : _d.patched) !== null && _e !== void 0 ? _e : cardModPatchState === null || cardModPatchState === void 0 ? void 0 : cardModPatchState[key]) !== null && _f !== void 0 ? _f : false;
        if (patched || cardModPatched) {
            log_patch_warning(key);
            return;
        }
        patchState[key] = { patched: true, version: pjson.version };
        patch_prototype(element, constructor, afterwards);
    };
}
function log_patch_warning(key) {
    var _a, _b;
    if (window.uix_patch_warning)
        return;
    window.uix_patch_warning = true;
    const message = `UIX (${pjson.version}): ${key} already patched by ${((_a = patchState[key]) === null || _a === void 0 ? void 0 : _a.version) || (cardModPatchState[key] ? `Card-mod (${((_b = cardModPatchState[key]) === null || _b === void 0 ? void 0 : _b.version) || "unknown Card-mod version"})` : "unknown version")}!`;
    const details = [
        "Make sure you are using the latest version of UIX.",
    ];
    selectTree(document.body, "home-assistant").then((haEl) => {
        var _a, _b, _c, _d, _e;
        if (haEl === null || haEl === void 0 ? void 0 : haEl.hass) {
            (_d = (_b = (_a = haEl.hass.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = haEl.hass.user) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : "unknown_user";
            const info = `User: ${((_e = haEl.hass.user) === null || _e === void 0 ? void 0 : _e.name) || "unknown"}\n\nBrowser: ${navigator.userAgent}`;
            haEl.hass.callService("system_log", "write", {
                logger: `uix.${pjson.version}`,
                level: "warning",
                message: `${message} ${details.join(" ")} ${info}`,
            }, undefined, false).catch(error => {
                console.error("UIX: Failed to create duplicate patch warning notification", error);
            });
        }
    });
}

const EXCLUDED_CARDS = [
    "conditional",
    "entity-filter",
];
let HuiCardPatch = class HuiCardPatch extends ModdedElement {
    constructor() {
        super(...arguments);
        this._uix = [];
    }
    async _add_card_mod() {
        var _a, _b, _c, _d, _e;
        if (!this._element)
            return;
        if (EXCLUDED_CARDS.includes((_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.toLowerCase()))
            return;
        const element = this._element;
        const config = (element === null || element === void 0 ? void 0 : element.config) || (element === null || element === void 0 ? void 0 : element._config) || this.config;
        const cls = `type-${(_d = (_c = config === null || config === void 0 ? void 0 : config.type) === null || _c === void 0 ? void 0 : _c.replace) === null || _d === void 0 ? void 0 : _d.call(_c, ":", "-")}`;
        await apply_uix(this._element, "card", (_e = config === null || config === void 0 ? void 0 : config.uix) !== null && _e !== void 0 ? _e : config === null || config === void 0 ? void 0 : config.card_mod, { config }, true, cls);
    }
    _loadElement(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        this._add_card_mod();
    }
};
HuiCardPatch = __decorate([
    patch_element("hui-card")
], HuiCardPatch);

/*
Patch the ha-card element to on first update:
- if it's parent is a hui-card, do nothing (as that is already handled in hui-card patch)
- try to find the config parameter of it's parent element
- Apply uix styles according to that config
*/
let HaCardPatch = class HaCardPatch extends ModdedElement {
    constructor() {
        super(...arguments);
        this._uix = [];
    }
    async firstUpdated(_orig, ...args) {
        var _a, _b, _c, _d, _e, _f;
        await (_orig === null || _orig === void 0 ? void 0 : _orig(...args));
        const huiCard = (_b = (_a = this.parentNode) === null || _a === void 0 ? void 0 : _a.host) === null || _b === void 0 ? void 0 : _b.parentNode;
        if (huiCard && huiCard.localName === "hui-card")
            return;
        const config = findConfig(this);
        if (!config)
            return;
        const cls = `type-${(_d = (_c = config === null || config === void 0 ? void 0 : config.type) === null || _c === void 0 ? void 0 : _c.replace) === null || _d === void 0 ? void 0 : _d.call(_c, ":", "-")}`;
        await apply_uix(this, "card", (_e = config === null || config === void 0 ? void 0 : config.uix) !== null && _e !== void 0 ? _e : config === null || config === void 0 ? void 0 : config.card_mod, { config }, false, cls);
        const parent = (_f = this.parentNode) === null || _f === void 0 ? void 0 : _f.host;
        if (!parent)
            return;
        patch_object(parent, ModdedElement);
        parent._uix = this._uix;
    }
};
HaCardPatch = __decorate([
    patch_element("ha-card")
], HaCardPatch);
function findConfig(node) {
    if (node.config)
        return node.config;
    if (node._config)
        return node._config;
    if (node.host)
        return findConfig(node.host);
    if (node.parentElement)
        return findConfig(node.parentElement);
    if (node.parentNode)
        return findConfig(node.parentNode);
    return null;
}

/*
Patch the hui-grid-section element to on first update:
- config is available in this._config as set by parent hui-section
*/
let HuiGridSectionPatch = class HuiGridSectionPatch extends ModdedElement {
    firstUpdated(_orig, ...args) {
        var _a;
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        apply_uix(this, "grid-section", (_a = this._config.uix) !== null && _a !== void 0 ? _a : this._config.card_mod, { config: this._config }, true, "type-grid-section");
    }
};
HuiGridSectionPatch = __decorate([
    patch_element("hui-grid-section")
], HuiGridSectionPatch);
/*
Patch the hui-section element on first update:
- patch can only apply to strategies where cards can be modified
- apply uix to cards per types in uix config
*/
let HuiSectionPatch = class HuiSectionPatch extends ModdedElement {
    async _createCards(_orig, ...args) {
        var _a;
        const strategyConfig = (_a = this.config) === null || _a === void 0 ? void 0 : _a.strategy;
        const dynamicConfig = Object.assign({}, args[0]);
        if (strategyConfig && (strategyConfig.uix || strategyConfig.card_mod)) {
            Object.entries(dynamicConfig.cards).forEach(([idx, card]) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                if (card.type && (card.type in strategyConfig.uix || card.type in strategyConfig.card_mod)) {
                    (((_a = strategyConfig.uix) === null || _a === void 0 ? void 0 : _a.debug) || ((_b = strategyConfig.card_mod) === null || _b === void 0 ? void 0 : _b.debug)) &&
                        console.log("UIX Debug: adding uix to card", card, "with", (_d = (_c = strategyConfig.uix) === null || _c === void 0 ? void 0 : _c[card.type]) !== null && _d !== void 0 ? _d : (_e = strategyConfig.card_mod) === null || _e === void 0 ? void 0 : _e[card.type]);
                    dynamicConfig.cards[idx] = Object.assign(Object.assign({}, card), { uix: (_g = (_f = strategyConfig.uix) === null || _f === void 0 ? void 0 : _f[card.type]) !== null && _g !== void 0 ? _g : (_h = strategyConfig.card_mod) === null || _h === void 0 ? void 0 : _h[card.type] });
                }
            });
        }
        _orig === null || _orig === void 0 ? void 0 : _orig(dynamicConfig);
    }
};
HuiSectionPatch = __decorate([
    patch_element("hui-section")
], HuiSectionPatch);

const EXCLUDED_BADGES = [
    "entity-filter",
];
let HuiBadgePatch$1 = class HuiBadgePatch extends ModdedElement {
    async _add_uix() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this._element)
            return;
        if (EXCLUDED_BADGES.includes((_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.toLowerCase()))
            return;
        const cls = `type-${(_e = (_d = (_c = this.config) === null || _c === void 0 ? void 0 : _c.type) === null || _d === void 0 ? void 0 : _d.replace) === null || _e === void 0 ? void 0 : _e.call(_d, ":", "-")}`;
        await apply_uix(this._element, "badge", (_g = (_f = this.config) === null || _f === void 0 ? void 0 : _f.uix) !== null && _g !== void 0 ? _g : (_h = this.config) === null || _h === void 0 ? void 0 : _h.card_mod, { config: this.config }, true, cls);
        this._uix = this._element._uix;
    }
    _loadElement(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        this._add_uix();
    }
    _updateElement(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        this._add_uix();
    }
};
HuiBadgePatch$1 = __decorate([
    patch_element("hui-badge")
], HuiBadgePatch$1);

let HuiBadgePatch = class HuiBadgePatch extends ModdedElement {
    async _add_uix() {
        var _a, _b, _c, _d;
        if (!this._element)
            return;
        const cls = `type-${(_c = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.replace) === null || _c === void 0 ? void 0 : _c.call(_b, ":", "-")}`;
        await apply_uix(this._element, "heading-badge", (_d = this.config.uix) !== null && _d !== void 0 ? _d : this.config.card_mod, { config: this.config }, true, cls);
        this._uix = this._element._uix;
    }
    _loadElement(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        this._add_uix();
    }
    _updateElement(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        this._add_uix();
    }
};
HuiBadgePatch = __decorate([
    patch_element("hui-heading-badge")
], HuiBadgePatch);

/*
Patch ha-assist-chip on first update
*/
let HaAssistChipPatch = class HaAssistChipPatch extends ModdedElement {
    async firstUpdated(_orig, ...args) {
        var _a, _b, _c;
        await (_orig === null || _orig === void 0 ? void 0 : _orig(...args));
        await apply_uix(this, "assist-chip", (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.uix) !== null && _b !== void 0 ? _b : (_c = this.config) === null || _c === void 0 ? void 0 : _c.card_mod, { config: this.config }, true, "type-assist-chip");
    }
};
HaAssistChipPatch = __decorate([
    patch_element("ha-assist-chip")
], HaAssistChipPatch);

/*
Patch the hui-entities-card specifically in order to handle individual styling of each row
*/
let HuiEntitiesCardPatch = class HuiEntitiesCardPatch extends ModdedElement {
    _renderEntity(_orig, config, ...rest) {
        var _a, _b;
        const retval = _orig === null || _orig === void 0 ? void 0 : _orig(config, ...rest);
        if ((config === null || config === void 0 ? void 0 : config.type) === "custom:mod-card")
            return retval;
        if (!(retval === null || retval === void 0 ? void 0 : retval.values))
            return retval;
        const row = retval.values[1];
        if (!row)
            return retval;
        const cls = (config === null || config === void 0 ? void 0 : config.type) ?
            `type-${(_b = (_a = config.type).replace) === null || _b === void 0 ? void 0 : _b.call(_a, ":", "-")}` : "type-entity";
        const apply = async () => {
            var _a;
            await await_element(row);
            patch_object(row, ModdedElement);
            apply_uix(row, "row", (_a = config === null || config === void 0 ? void 0 : config.uix) !== null && _a !== void 0 ? _a : config === null || config === void 0 ? void 0 : config.card_mod, { config }, true, cls);
            row.addEventListener("ll-rebuild", apply);
        };
        Promise.all([this.updateComplete]).then(() => apply());
        return retval;
    }
};
HuiEntitiesCardPatch = __decorate([
    patch_element("hui-entities-card")
], HuiEntitiesCardPatch);
/*
Patch conditional row specifically as it creates rows dynamically
*/
let HuiConditionalRowPatch = class HuiConditionalRowPatch extends ModdedElement {
    setConfig(_orig, config, ...args) {
        var _a, _b, _c, _d;
        _orig === null || _orig === void 0 ? void 0 : _orig(config, ...args);
        const row = this._element;
        if (!row)
            return;
        if (!(config === null || config === void 0 ? void 0 : config.row) || ((_a = config === null || config === void 0 ? void 0 : config.row) === null || _a === void 0 ? void 0 : _a.type) === "custom:mod-card")
            return;
        const cls = ((_b = config === null || config === void 0 ? void 0 : config.row) === null || _b === void 0 ? void 0 : _b.type) ?
            `type-${(_d = (_c = config.row.type).replace) === null || _d === void 0 ? void 0 : _d.call(_c, ":", "-")}` : "type-entity";
        const apply = async () => {
            var _a;
            await await_element(row);
            patch_object(row, ModdedElement);
            apply_uix(row, "row", (_a = config.row.uix) !== null && _a !== void 0 ? _a : config.row.card_mod, { config: config.row }, true, cls);
            row.addEventListener("ll-rebuild", apply);
        };
        Promise.all([this.updateComplete]).then(() => apply());
    }
};
HuiConditionalRowPatch = __decorate([
    patch_element("hui-conditional-row")
], HuiConditionalRowPatch);

/*
Patch the hui-glance-card specifically in order to handle individual styling of each item
Items in glance cards are not isolated like rows in entities cards, so the styling options
are somewhat limited. Therefore this patch creates a separate shadowRoot for each item.
*/
// https://github.com/home-assistant/frontend/blob/8c39ed46a83e7e889c389af466c0fd1b07fbf6fd/src/panels/lovelace/cards/hui-glance-card.ts#L202-L211
// https://github.com/home-assistant/frontend/blob/8c39ed46a83e7e889c389af466c0fd1b07fbf6fd/src/panels/lovelace/cards/hui-glance-card.ts#L231-L233
const ENTITY_STYLES = `
div {
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.name {
  min-height: var(--paper-font-body1_-_line-height, 20px);
}
state-badge {
  margin: 8px 0;
}
`;
let HuiGlanceCardPatch = class HuiGlanceCardPatch extends ModdedElement {
    // hui-glance-card has a renderEntity method, but the return from that is too messy
    // Instead find every icon after render in the updated method.
    updated(_orig, ...args) {
        var _a, _b, _c, _d;
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        // Each entity of a glance card is contained in a div.entity
        // Go through each and apply styling individually
        for (const el of this.shadowRoot.querySelectorAll("ha-card div.entity")) {
            patch_object(el, ModdedElement);
            // Create a shadowroot for each entity
            // This makes it easier to style entities individually without styles "leaking" out
            const root = (_a = el.shadowRoot) !== null && _a !== void 0 ? _a : el.attachShadow({ mode: "open" });
            while (el.firstChild)
                root.append(el.firstChild);
            // Add default styles into shadowRoot
            const styleTag = (_b = el.querySelector("style[uix]")) !== null && _b !== void 0 ? _b : document.createElement("style");
            styleTag.setAttribute("uix", "");
            styleTag.innerHTML = ENTITY_STYLES;
            root.append(styleTag);
            // Thankfully the configuration data for the glance entity is added to the div for some reason
            // https://github.com/home-assistant/frontend/blob/8c39ed46a83e7e889c389af466c0fd1b07fbf6fd/src/panels/lovelace/cards/hui-glance-card.ts#L275
            const config = (_c = el["config"]) !== null && _c !== void 0 ? _c : el["entityConfig"];
            apply_uix(el, "glance", (_d = config === null || config === void 0 ? void 0 : config.uix) !== null && _d !== void 0 ? _d : config === null || config === void 0 ? void 0 : config.card_mod, { config });
        }
    }
};
HuiGlanceCardPatch = __decorate([
    patch_element("hui-glance-card")
], HuiGlanceCardPatch);

/*
Patch the hui-picture-elements-card specifically in order to handle individual styling of each element
*/
let PictureElementsCardPatch = class PictureElementsCardPatch extends ModdedElement {
    setConfig(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        const apply = async () => {
            var _a, _b, _c;
            for (const [i, el] of this._elements.entries()) {
                await await_element(el);
                patch_object(el, ModdedElement);
                const config = this._config.elements[i];
                const cls = `type-${(_b = (_a = config === null || config === void 0 ? void 0 : config.type) === null || _a === void 0 ? void 0 : _a.replace) === null || _b === void 0 ? void 0 : _b.call(_a, ":", "-")}`;
                apply_uix(el, "element", (_c = config === null || config === void 0 ? void 0 : config.uix) !== null && _c !== void 0 ? _c : config === null || config === void 0 ? void 0 : config.card_mod, { config }, true, cls);
            }
        };
        Promise.all([this.updateComplete]).then(() => apply());
    }
};
PictureElementsCardPatch = __decorate([
    patch_element("hui-picture-elements-card")
], PictureElementsCardPatch);
/*
Patch conditional element specifically as it creates elements dynamically
*/
let HuiConditionalElementPatch = class HuiConditionalElementPatch extends ModdedElement {
    setConfig(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        const apply = async () => {
            var _a, _b, _c;
            for (const [i, el] of this._elements.entries()) {
                await await_element(el);
                patch_object(el, ModdedElement);
                const config = this._config.elements[i];
                const cls = `type-${(_b = (_a = config === null || config === void 0 ? void 0 : config.type) === null || _a === void 0 ? void 0 : _a.replace) === null || _b === void 0 ? void 0 : _b.call(_a, ":", "-")}`;
                apply_uix(el, "element", (_c = config === null || config === void 0 ? void 0 : config.uix) !== null && _c !== void 0 ? _c : config === null || config === void 0 ? void 0 : config.card_mod, { config }, true, cls);
            }
        };
        Promise.all([this.updateComplete]).then(() => apply());
    }
};
HuiConditionalElementPatch = __decorate([
    patch_element("hui-conditional-element")
], HuiConditionalElementPatch);

/*
Patch various icon elements to consider the following variables:
--card-mod-icon
--card-mod-icon-color
--card-mod-icon-dim
*/
const updateIcon = (el) => {
    const styles = window.getComputedStyle(el);
    const icon = styles.getPropertyValue("--uix-icon") || styles.getPropertyValue("--card-mod-icon");
    if (icon)
        el.icon = icon.trim();
    const color = styles.getPropertyValue("--uix-icon-color") || styles.getPropertyValue("--card-mod-icon-color");
    if (color)
        el.style.color = color;
    const filter = styles.getPropertyValue("--uix-icon-dim") || styles.getPropertyValue("--card-mod-icon-dim");
    if (filter === "none")
        el.style.filter = "none";
};
const bindUix = async (el) => {
    // Find the most relevant uix-nodes in order to listen to change events so we can react quickly
    var _a;
    updateIcon(el);
    el._boundUix = (_a = el._boundUix) !== null && _a !== void 0 ? _a : new Set();
    const newUix = await findParentUix(el);
    for (const uix of newUix) {
        if (el._boundUix.has(uix))
            continue;
        uix.addEventListener("uix-styles-update", async () => {
            await uix.updateComplete;
            updateIcon(el);
        });
        el._boundUix.add(uix);
    }
    // Find uix elements created later, increased interval
    if (el.cm_retries < 5) {
        el.cm_retries++;
        return window.setTimeout(() => bindUix(el), 250 * el.cm_retries);
    }
};
let HaStateIconPatch = class HaStateIconPatch extends ModdedElement {
    constructor() {
        super(...arguments);
        this.cm_retries = 0;
    }
    updated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        this.cm_retries = 0;
        bindUix(this);
    }
};
HaStateIconPatch = __decorate([
    patch_element("ha-state-icon")
], HaStateIconPatch);
let HaIconPatch = class HaIconPatch extends ModdedElement {
    constructor() {
        super(...arguments);
        this.cm_retries = 0;
    }
    updated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        this.cm_retries = 0;
        bindUix(this);
    }
};
HaIconPatch = __decorate([
    patch_element("ha-icon")
], HaIconPatch);
let HaSvgIconPatch = class HaSvgIconPatch extends ModdedElement {
    constructor() {
        super(...arguments);
        this.cm_retries = 0;
    }
    updated(_orig, ...args) {
        var _a, _b;
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        if (((_b = (_a = this.parentNode) === null || _a === void 0 ? void 0 : _a.host) === null || _b === void 0 ? void 0 : _b.localName) === "ha-icon")
            return;
        this.cm_retries = 0;
        bindUix(this);
    }
};
HaSvgIconPatch = __decorate([
    patch_element("ha-svg-icon")
], HaSvgIconPatch);
function joinSet(dst, src) {
    for (const s of src)
        dst.add(s);
}
async function findParentUix(node, step = 0) {
    let uixElements = new Set();
    if (step == 10)
        return uixElements;
    if (!node)
        return uixElements;
    if (node.updateComplete)
        await node.updateComplete;
    if (node._uix) {
        for (const uix of node._uix) {
            if (uix.styles)
                uixElements.add(uix);
        }
    }
    if (node.parentElement)
        joinSet(uixElements, await findParentUix(node.parentElement, step + 1));
    else if (node.parentNode)
        joinSet(uixElements, await findParentUix(node.parentNode, step + 1));
    if (node.host)
        joinSet(uixElements, await findParentUix(node.host, step + 1));
    return uixElements;
}

/*
Patch hui-view for theme styling

There is no style passed to apply_uix here, everything comes only from themes.

*/
let HuiViewPatch = class HuiViewPatch extends ModdedElement {
    updated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        apply_uix(this, "view", undefined, {}, false);
    }
};
HuiViewPatch = __decorate([
    patch_element("hui-view")
], HuiViewPatch);

/*
Patch hui-root for theme styling

There is no style passed to apply_uix here, everything comes only from themes.
*/
// hui-root may have been used before the patch was applied
const apply$1 = () => {
    selectTree(document, "home-assistant$home-assistant-main$partial-panel-resolver ha-panel-lovelace$hui-root", false).then((root) => root === null || root === void 0 ? void 0 : root.firstUpdated());
};
let HuiRootPatch = class HuiRootPatch extends ModdedElement {
    firstUpdated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        apply_uix(this, "root");
    }
};
HuiRootPatch = __decorate([
    patch_element("hui-root", apply$1)
], HuiRootPatch);

/*
Patch ha-drawer for theme styling

There is no style passed to apply_uix here, everything comes only from themes.

*/
let HaDrawerPatch = class HaDrawerPatch extends ModdedElement {
    updated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        apply_uix(this, "drawer", undefined, {}, true);
    }
};
HaDrawerPatch = __decorate([
    patch_element("ha-drawer")
], HaDrawerPatch);

function stripHtmlAndFunctions(value, seen = new WeakSet()) {
    if (value == null)
        return value;
    const t = typeof value;
    // Strip functions
    if (t === "function")
        return undefined;
    // Strip HTMLElements / Elements (handles different environments)
    if ((typeof HTMLElement !== "undefined" && value instanceof HTMLElement) ||
        (typeof Element !== "undefined" && value instanceof Element)) {
        return undefined;
    }
    // Primitives remain
    if (t !== "object")
        return value;
    // Prevent infinite recursion on circular refs
    if (seen.has(value))
        return undefined;
    seen.add(value);
    // Arrays: sanitize elements and remove stripped ones
    if (Array.isArray(value)) {
        const arr = value
            .map((v) => stripHtmlAndFunctions(v, seen))
            .filter((v) => v !== undefined);
        return arr;
    }
    // Objects: sanitize each property
    const out = {};
    for (const [k, v] of Object.entries(value)) {
        const cleaned = stripHtmlAndFunctions(v, seen);
        if (cleaned !== undefined)
            out[k] = cleaned;
    }
    return out;
}
class HaDialogPatch extends ModdedElement {
    async showDialog(_orig, params, ...rest) {
        await (_orig === null || _orig === void 0 ? void 0 : _orig(params, ...rest));
        this.requestUpdate();
        this.updateComplete.then(async () => {
            var _a, _b;
            let haDialog = this.shadowRoot.querySelector("ha-dialog");
            if (!haDialog) {
                haDialog = this.shadowRoot.querySelector("ha-adaptive-dialog");
            }
            if (!haDialog) {
                // Notification 'dialog' is ha-drawer
                haDialog = this.shadowRoot.querySelector("ha-drawer");
            }
            if (!haDialog)
                return;
            const cls = `type-${(_b = (_a = this.localName).replace) === null || _b === void 0 ? void 0 : _b.call(_a, "ha-", "")}`;
            apply_uix(haDialog, "dialog", undefined, {
                params: stripHtmlAndFunctions(params),
            }, false, cls);
        });
    }
}
function patchDialog(ev) {
    var _a;
    const dialogTag = (_a = ev.detail) === null || _a === void 0 ? void 0 : _a.dialogTag;
    if (dialogTag && !is_patched(dialogTag)) {
        set_patched(dialogTag);
        patch_prototype(dialogTag, HaDialogPatch);
    }
}
window.addEventListener("show-dialog", patchDialog, { capture: true });

/*
Patch ha-more-info-dialog to style more-info popups.

There is no style passed to apply_uix here, everything comes only from themes.
*/
let MoreInfoDIalogPatch = class MoreInfoDIalogPatch extends ModdedElement {
    showDialog(_orig, params, ...rest) {
        _orig === null || _orig === void 0 ? void 0 : _orig(params, ...rest);
        this.requestUpdate();
        this.updateComplete.then(async () => {
            var _a;
            const haDialog = (_a = this.shadowRoot.querySelector("ha-adaptive-dialog")) !== null && _a !== void 0 ? _a : this.shadowRoot.querySelector("ha-dialog");
            if (!haDialog)
                return;
            apply_uix(haDialog, "more-info", undefined, {
                config: params,
            }, false);
        });
    }
};
MoreInfoDIalogPatch = __decorate([
    patch_element("ha-more-info-dialog")
], MoreInfoDIalogPatch);

/*
Patch ha-sidebar for theme styling

There is no style passed to apply_uix here, everything comes only from themes.
*/
// ha-sidebar may have been used before the patch was applied
const apply = () => {
    selectTree(document, "home-assistant$home-assistant-main$ha-sidebar", false).then((root) => root === null || root === void 0 ? void 0 : root.firstUpdated());
};
let SidebarPatch = class SidebarPatch extends ModdedElement {
    // @ts-ignore
    firstUpdated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        apply_uix(this, "sidebar");
    }
};
SidebarPatch = __decorate([
    patch_element("ha-sidebar", apply)
], SidebarPatch);

class ConfigElementPatch extends s {
    setConfig(_orig, config, ...rest) {
        var _a, _b;
        const newConfig = JSON.parse(JSON.stringify(config));
        // Save uix config
        this._uixData = {
            uix: undefined,
            card_mod: undefined,
            entities: [],
        };
        if (newConfig.uix) {
            this._uixData.uix = newConfig.uix;
        }
        else if (newConfig.card_mod) {
            this._uixData.card_mod = newConfig.card_mod;
        }
        delete newConfig.uix;
        delete newConfig.card_mod;
        // Save uix config for individual entities
        if (Array.isArray(newConfig.entities)) {
            for (const [i, e] of (_b = (_a = newConfig.entities) === null || _a === void 0 ? void 0 : _a.entries) === null || _b === void 0 ? void 0 : _b.call(_a)) {
                this._uixData.entities[i] = { uix: undefined, card_mod: undefined };
                if (e.uix) {
                    this._uixData.entities[i].uix = e.uix;
                }
                else if (e.card_mod) {
                    this._uixData.entities[i].card_mod = e.card_mod;
                }
                delete e.uix;
                delete e.card_mod;
            }
        }
        _orig(newConfig, ...rest);
    }
}
let HuiCardElementEditorPatch = class HuiCardElementEditorPatch extends s {
    async getConfigElement(_orig, ...args) {
        const retval = await _orig(...args);
        patch_object(retval, ConfigElementPatch);
        return retval;
    }
    _handleConfigChanged(_orig, ev, ...rest) {
        var _a;
        const uixData = (_a = this._configElement) === null || _a === void 0 ? void 0 : _a._uixData;
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
};
HuiCardElementEditorPatch = __decorate([
    patch_element("hui-card-element-editor")
], HuiCardElementEditorPatch);
let HuiDialogEditCardPatch = class HuiDialogEditCardPatch extends s {
    updated(_orig, ...args) {
        var _a, _b;
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        if (!this._uixIcon) {
            this._uixIcon = document.createElement("ha-icon");
            this._uixIcon.icon = "mdi:brush";
        }
        const button = this.shadowRoot.querySelector("ha-button[slot=secondaryAction]");
        if (!button)
            return;
        button.appendChild(this._uixIcon);
        if (((_a = JSON.stringify(this._cardConfig)) === null || _a === void 0 ? void 0 : _a.includes("uix")) || ((_b = JSON.stringify(this._cardConfig)) === null || _b === void 0 ? void 0 : _b.includes("card_mod"))) {
            this._uixIcon.style.visibility = "visible";
        }
        else {
            this._uixIcon.style.visibility = "hidden";
        }
    }
};
HuiDialogEditCardPatch = __decorate([
    patch_element("hui-dialog-edit-card")
], HuiDialogEditCardPatch);

/*
Patch ha-panel-config for theme styling
Config panels are routed via removing last Child and adding a new one.
Hence we need to prepend uix element to not interfere with the routing.

There is no style passed to apply_uix here, everything comes only from themes.

This will only work if uix loaded as a Frontend module.
*/
let HaConfigPatch = class HaConfigPatch extends ModdedElement {
    updated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        apply_uix(this, "config", { prepend: true });
    }
};
HaConfigPatch = __decorate([
    patch_element("ha-panel-config")
], HaConfigPatch);
/*
Patch ha-panel-custom
*/
let HaPanelCustomPatch = class HaPanelCustomPatch extends ModdedElement {
    updated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        apply_uix(this, "panel-custom", { prepend: true });
    }
};
HaPanelCustomPatch = __decorate([
    patch_element("ha-panel-custom")
], HaPanelCustomPatch);
/* Patch ha-top-app-bar-fixed for theme styling
This is needed to best style the top app bar in the config panel.
The ultimate background styling for config panels come from this element.
*/
let HaTopAppBarFixedPatch = class HaTopAppBarFixedPatch extends ModdedElement {
    updated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        apply_uix(this, "top-app-bar-fixed");
    }
};
HaTopAppBarFixedPatch = __decorate([
    patch_element("ha-top-app-bar-fixed")
], HaTopAppBarFixedPatch);

/*
Patch ha-config-* for theme styling

There is no style passed to apply_uix here, everything comes only from themes.

This will only work if uix loaded as a Frontend module.
*/
let HaPanelDeveloperToolsPatch = class HaPanelDeveloperToolsPatch extends ModdedElement {
    updated(_orig, ...args) {
        _orig === null || _orig === void 0 ? void 0 : _orig(...args);
        apply_uix(this, "developer-tools");
    }
};
HaPanelDeveloperToolsPatch = __decorate([
    patch_element("ha-panel-developer-tools")
], HaPanelDeveloperToolsPatch);

const NO_STYLE = `
ha-card {
  background: none;
  box-shadow: none;
  border: none;
  transition: none;
}`;
class ModCard extends s {
    setConfig(config) {
        var _a, _b, _c, _d, _e, _f, _g;
        this._config = JSON.parse(JSON.stringify(config));
        let style = ((_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.uix) === null || _b === void 0 ? void 0 : _b.style) || ((_d = (_c = this._config) === null || _c === void 0 ? void 0 : _c.card_mod) === null || _d === void 0 ? void 0 : _d.style) || ((_e = this._config) === null || _e === void 0 ? void 0 : _e.style);
        if (style === undefined) {
            style = NO_STYLE;
        }
        else if (typeof style === "string") {
            style = NO_STYLE + style;
        }
        else if (style["."]) {
            style["."] = NO_STYLE + style["."];
        }
        else {
            style["."] = NO_STYLE;
        }
        this._config.uix = {
            style,
            debug: ((_f = this._config.uix) === null || _f === void 0 ? void 0 : _f.debug) || ((_g = this._config.card_mod) === null || _g === void 0 ? void 0 : _g.debug) || false,
        };
        this.build_card(config.card);
    }
    async build_card(config) {
        if (this._hass === undefined)
            await new Promise((resolve) => (this._hassResolve = resolve));
        this._hassResolve = undefined;
        const helpers = await window.loadCardHelpers();
        this.card = await helpers.createCardElement(config);
        this.card.hass = this._hass;
    }
    firstUpdated() {
        window.setTimeout(() => {
            var _a, _b;
            if ((_b = (_a = this.card) === null || _a === void 0 ? void 0 : _a.shadowRoot) === null || _b === void 0 ? void 0 : _b.querySelector("ha-card")) {
                console.info("%cCheck your UIX configuration!", "color: red; font-weight: bold");
                let cardName = this.card.localName.replace(/hui-(.*)-card/, "$1");
                console.info(`mod-card should RARELY be used with a card that already has a ha-card element, such as ${cardName}`);
            }
        }, 3000);
    }
    set hass(hass) {
        this._hass = hass;
        if (this.card)
            this.card.hass = hass;
        if (this._hassResolve)
            this._hassResolve();
    }
    render() {
        return x ` <ha-card modcard> ${this.card} </ha-card> `;
    }
    getCardSize() {
        if (this._config.report_size)
            return this._config.report_size;
        let ret = this.shadowRoot;
        if (ret)
            ret = ret.querySelector("ha-card card-maker");
        if (ret)
            ret = ret.getCardSize;
        if (ret)
            ret = ret();
        if (ret)
            return ret;
        return 1;
    }
}
__decorate([
    n()
], ModCard.prototype, "card", void 0);
if (!customElements.get("mod-card")) {
    customElements.define("mod-card", ModCard);
}
(async () => {
    // See explanation in card-mod.ts
    while (customElements.get("home-assistant") === undefined)
        await new Promise((resolve) => window.setTimeout(resolve, 100));
    if (!customElements.get("mod-card")) {
        customElements.define("mod-card", ModCard);
    }
})();
