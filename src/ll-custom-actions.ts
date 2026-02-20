// Add a listener to allow to clear Frontend cache via Home Assistant action
window.addEventListener("uix-bootstrap", async (ev: CustomEvent) => {
  ev.stopPropagation();
  document.addEventListener("ll-custom", (event: CustomEvent) => {
    const detail = event.detail;
    if (!detail || typeof detail !== "object") {
      return;
    }
    const uix = (detail as any).uix ?? (detail as any).card_mod;
    if (!uix || typeof uix !== "object") {
      return;
    }
    const actionName = (uix as any).action;
    if (actionName && typeof actionName === "string" && typeof Actions[actionName] === "function") {
      try {
        const result = (Actions as any)[actionName]();
        if (result && typeof (result as Promise<unknown>).catch === "function") {
          (result as Promise<unknown>).catch((error: unknown) => {
            console.error(`UIX: Error while executing action "${actionName}":`, error);
          });
        }
      } catch (error) {
        console.error(`UIX: Error while executing action "${actionName}":`, error);
      }
    }
  });
});

export class Actions {
  static async clear_cache() {
    if (window.caches) {
      try {
        const cacheNames = await window.caches.keys();
        const deletePromises: Promise<boolean>[] = [];
        cacheNames.forEach((cacheName) => {
          deletePromises.push(window.caches.delete(cacheName));
        });
        await Promise.all(deletePromises);
        window.location.reload();
      } catch (error) {
        console.error("UIX: Failed to clear caches:", error);
        // Fallback: force a full reload even if cache clearing fails
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  }
}