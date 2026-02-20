import "../helpers/event-target-polyfill.js";
import { ConnectionMixin } from "./connection.js";
import { VersionMixin } from "./version.js";

class UixCoordinator extends 
  VersionMixin(
    ConnectionMixin(EventTarget) 
  ) {
    constructor() {
        super();
        this.connect();
    }
}

window.addEventListener("uix-bootstrap", async (ev: CustomEvent) => {
  ev.stopPropagation();
  if (!(window as any).uixCoordinator) {
    (window as any).uixCoordinator = new UixCoordinator();
  }
});