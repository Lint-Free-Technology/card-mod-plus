/**
 * UIX Console Debug Helpers
 *
 * Two functions are attached to `window` for use in the browser DevTools console:
 *
 *   uix_tree($0)  – General helper: reports the UIX parent, active child paths and
 *                   all element paths available for styling within the UIX parent's
 *                   subtree.
 *
 *   uix_path($0)  – Specific helper: reports the UIX path from the UIX parent to the
 *                   selected element, CSS targeting info within its shadow root and a
 *                   boilerplate UIX YAML snippet.
 */

interface UixParentInfo {
  element: Element;
  uixNodes: any[];
  primaryType: string;
}

// ---------------------------------------------------------------------------
// Utility: traverse the DOM upward, crossing shadow-root boundaries
// ---------------------------------------------------------------------------

function* domAncestorsAndSelf(el: Node): Generator<Node> {
  let current: Node = el;
  while (current) {
    yield current;
    if (current.parentNode) {
      current = current.parentNode;
    } else if ((current as ShadowRoot).host) {
      // Cross shadow-root boundary
      current = (current as ShadowRoot).host;
    } else {
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Find the closest ancestor (or self) that has a non-child UIX node
// ---------------------------------------------------------------------------

function findUixParent(element: Element): UixParentInfo | null {
  for (const node of domAncestorsAndSelf(element)) {
    if (!(node instanceof Element)) continue;
    const uixNodes: any[] = (node as any)._uix ?? [];
    const nonChild = uixNodes.filter(
      (u: any) => u.type && !u.type.endsWith("-child")
    );
    if (nonChild.length > 0) {
      return {
        element: node,
        uixNodes: nonChild,
        primaryType: nonChild[0].type,
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Build a CSS selector string for a single element
// ---------------------------------------------------------------------------

function buildSelector(el: Element): string {
  const tag = el.localName;

  // ID is the most specific and unambiguous selector
  if (el.id) return `${tag}#${el.id}`;

  const parent = el.parentNode as ParentNode | null;
  const sameSiblings = parent
    ? Array.from(parent.children ?? []).filter(
        (s: Element) => s !== el && s.localName === tag
      )
    : [];

  if (sameSiblings.length === 0) {
    // No disambiguation needed.
    // For custom elements (tag includes "-") the tag name alone is usually unique.
    if (tag.includes("-")) return tag;
    // For plain HTML elements add the first meaningful class, if any.
    const firstClass = Array.from(el.classList).find((c) => c.length > 0);
    return firstClass ? `${tag}.${firstClass}` : tag;
  }

  // Disambiguation: try a unique class first, then fall back to :nth-of-type.
  const uniqueClass = Array.from(el.classList).find(
    (c) => !sameSiblings.some((s: Element) => s.classList.contains(c))
  );
  if (uniqueClass) return `${tag}.${uniqueClass}`;

  const allSame = parent
    ? Array.from(parent.children ?? []).filter(
        (s: Element) => s.localName === tag
      )
    : [el];
  return `${tag}:nth-of-type(${allSame.indexOf(el) + 1})`;
}

// ---------------------------------------------------------------------------
// Build a CSS identifier (class / id / element) for the element itself,
// without disambiguation – used for the CSS-target report.
// ---------------------------------------------------------------------------

function buildCssIdentifier(el: Element): string {
  if (el.id) return `#${el.id}`;
  const firstClass = Array.from(el.classList).find((c) => c.length > 0);
  if (firstClass) return `.${firstClass}`;
  return el.localName;
}

// ---------------------------------------------------------------------------
// The "UIX context" for a parent element is its shadow root when present,
// otherwise the element itself.  Paths in selectTree are relative to this.
// ---------------------------------------------------------------------------

function uixContext(uixParentEl: Element): Element | ShadowRoot {
  return uixParentEl.shadowRoot ?? uixParentEl;
}

// ---------------------------------------------------------------------------
// Build UIX-style path from the UIX parent context to a target element.
// Returns null when the target is not reachable.
// Returns "." when the target IS the UIX parent.
// ---------------------------------------------------------------------------

function buildUixPath(uixParentEl: Element, targetEl: Element): string | null {
  if (targetEl === uixParentEl) return ".";

  const ctx = uixContext(uixParentEl);
  const parts: string[] = [];
  let current: Node = targetEl;

  while (current) {
    if (current === ctx || current === uixParentEl) break;

    if (current instanceof ShadowRoot) {
      parts.unshift("$");
      current = current.host;
    } else if (current instanceof Element) {
      if (current.localName !== "uix-node") {
        parts.unshift(buildSelector(current));
      }
      current = current.parentNode ?? null;
    } else {
      current = (current as any).parentNode ?? null;
    }
  }

  if (current !== ctx && current !== uixParentEl) return null;
  return parts.join(" ").trim() || ".";
}

// ---------------------------------------------------------------------------
// Collect all element paths reachable from the UIX parent context, up to
// (but not including) the next UIX parent boundary.
// ---------------------------------------------------------------------------

// Limit traversal depth to avoid spending excessive time on deeply-nested
// shadow DOM trees while still covering the most common two-to-three level
// hierarchies found in Home Assistant cards.
const MAX_TRAVERSAL_DEPTH = 6;

function collectSubtreePaths(uixParentEl: Element): string[] {
  const paths: string[] = ["."];
  const visited = new WeakSet<Element>();

  function traverse(
    node: Element | ShadowRoot,
    currentParts: string[],
    depth: number
  ) {
    if (depth > MAX_TRAVERSAL_DEPTH) return;
    for (const child of Array.from((node as ParentNode).children ?? [])) {
      if (child.localName === "uix-node") continue;
      if (visited.has(child)) continue;
      visited.add(child);

      const sel = buildSelector(child);
      const childParts = [...currentParts, sel];
      paths.push(childParts.join(" ").trim());

      // Do not descend into another UIX parent (different styling boundary)
      const isNextUixParent = ((child as any)._uix ?? []).some(
        (u: any) => u.type && !u.type.endsWith("-child")
      );
      if (!isNextUixParent) {
        if (child.shadowRoot) {
          traverse(child.shadowRoot, [...childParts, "$"], depth + 1);
        }
        traverse(child, childParts, depth + 1);
      }
    }
  }

  traverse(uixContext(uixParentEl), [], 0);
  return paths;
}

// ---------------------------------------------------------------------------
// Resolve the actively-styled child paths tracked on a UIX node.
// uix_children is Record<path, Promise<Array<Promise<Uix>>>>
// ---------------------------------------------------------------------------

async function getActiveChildren(
  uixParent: UixParentInfo
): Promise<Array<{ path: string; elements: Element[] }>> {
  const results: Array<{ path: string; elements: Element[] }> = [];

  for (const uixNode of uixParent.uixNodes) {
    for (const [path, promise] of Object.entries(
      (uixNode.uix_children as Record<string, Promise<Array<Promise<any>>>>) ??
        {}
    )) {
      try {
        const arr = await promise;
        const elements: Element[] = [];
        if (arr) {
          for (const p of arr) {
            const u = await p.catch(() => null);
            if (!u) continue;
            // The uix-node is inside the child element's shadow root (or the
            // element itself), so the actual styled element is the host.
            const host =
              u.parentNode instanceof ShadowRoot
                ? u.parentNode.host
                : u.parentElement;
            if (host) elements.push(host as Element);
          }
        }
        results.push({ path, elements });
      } catch {
        // Skip failed promises
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// uix_tree($0) – General UIX debug helper
// ---------------------------------------------------------------------------

(window as any).uix_tree = async function uix_tree(element: Element) {
  if (!element) {
    console.error(
      "UIX Debug: provide a DOM element – e.g. uix_tree($0) where $0 is the element selected in the Elements panel."
    );
    return;
  }

  const TITLE_STYLE = "color:#CE3226;font-weight:bold;font-size:1.1em;";
  console.group("%c🌳 UIX Tree Debug", TITLE_STYLE);
  console.log("Target element:", element);

  const parent = findUixParent(element);
  if (!parent) {
    console.warn("No UIX parent found for this element.");
    console.groupEnd();
    return;
  }

  // --- UIX Parent ---
  console.group("📦 Closest UIX Parent");
  console.log("Element:", parent.element);
  console.log("UIX type:", parent.primaryType);
  if (parent.uixNodes.length > 1)
    console.log("All UIX nodes on this element:", parent.uixNodes);
  console.groupEnd();

  // --- Active UIX Children ---
  const children = await getActiveChildren(parent);
  if (children.length > 0) {
    console.group(
      `👶 Active UIX Children  (${children.length} path${children.length !== 1 ? "s" : ""})`
    );
    for (const { path, elements } of children) {
      if (elements.length === 1) {
        console.log(`"${path}"  →`, elements[0]);
      } else if (elements.length > 1) {
        console.groupCollapsed(`"${path}"  (${elements.length} elements)`);
        elements.forEach((el) => console.log(el));
        console.groupEnd();
      } else {
        console.log(`"${path}"  (no resolved elements)`);
      }
    }
    console.groupEnd();
  } else {
    console.log("👶 Active UIX Children: none");
  }

  // --- Available Style Paths ---
  const paths = collectSubtreePaths(parent.element);
  console.group(`🗺️ Available Style Paths  (${paths.length})`);
  console.log(
    "Use these as keys in the UIX style config (relative to the UIX parent):"
  );
  paths.forEach((p) => console.log(`  "${p}"`));
  console.groupEnd();

  console.groupEnd();
};

// ---------------------------------------------------------------------------
// uix_path($0) – Specific UIX path helper
// ---------------------------------------------------------------------------

(window as any).uix_path = function uix_path(element: Element) {
  if (!element) {
    console.error(
      "UIX Debug: provide a DOM element – e.g. uix_path($0) where $0 is the element selected in the Elements panel."
    );
    return;
  }

  const TITLE_STYLE = "color:#CE3226;font-weight:bold;font-size:1.1em;";
  console.group("%c🎯 UIX Path Debug", TITLE_STYLE);
  console.log("Target element:", element);

  const parent = findUixParent(element);
  if (!parent) {
    console.warn("No UIX parent found for this element.");
    console.groupEnd();
    return;
  }

  // --- UIX Parent ---
  console.group("📦 Closest UIX Parent");
  console.log("Element:", parent.element);
  console.log("UIX type:", parent.primaryType);
  console.groupEnd();

  // --- Path to target ---
  const path = buildUixPath(parent.element, element);
  if (path === null) {
    console.warn(
      "Could not build a path: the element may not be a descendant of the UIX parent."
    );
    console.groupEnd();
    return;
  }

  console.group("📍 UIX Path to Target");
  console.log("Path:", `"${path}"`);
  console.log(
    "Use this as the key in the UIX style config (styles apply within this element's shadow-root context)."
  );
  console.groupEnd();

  // --- CSS target info ---
  console.group("🎨 CSS Target  (within the element's containing shadow root)");
  console.log("Tag:", element.localName);
  if (element.id) console.log("ID:", `#${element.id}`);
  if (element.classList.length > 0) {
    console.log(
      "Classes:",
      Array.from(element.classList)
        .map((c) => `.${c}`)
        .join("  ")
    );
  }

  // Determine whether $0 lives directly inside a shadow root.
  const parentNode = element.parentNode;
  if (parentNode instanceof ShadowRoot) {
    const hostPath = buildUixPath(parent.element, parentNode.host as Element);
    const cssSel = buildCssIdentifier(element);
    console.log(
      "Suggested CSS selector within shadow root:",
      cssSel
    );
    if (hostPath !== null) {
      console.log(
        "Tip: target the shadow-root host using path",
        `"${hostPath}"`,
        "and then use",
        `${cssSel} { … }`,
        "as the CSS rule."
      );
    }
  } else {
    console.log("Suggested CSS identifier:", buildCssIdentifier(element));
  }
  console.groupEnd();

  // --- Boilerplate YAML ---
  const cssSel = buildCssIdentifier(element);
  let yaml: string;

  if (path === ".") {
    yaml =
      `uix:\n` +
      `  style: |\n` +
      `    ${cssSel} {\n` +
      `      /* your styles for ${element.localName} */\n` +
      `    }`;
  } else {
    // If $0 is in a shadow root, the most natural pattern is to target $0's
    // shadow-root host with the path key and use a CSS selector within.
    const elementParentNode = element.parentNode;
    if (elementParentNode instanceof ShadowRoot) {
      const hostPath = buildUixPath(
        parent.element,
        elementParentNode.host as Element
      );
      if (hostPath && hostPath !== ".") {
        yaml =
          `uix:\n` +
          `  style:\n` +
          `    "${hostPath}": |\n` +
          `      ${cssSel} {\n` +
          `        /* your styles for ${element.localName} */\n` +
          `      }`;
      } else {
        yaml =
          `uix:\n` +
          `  style: |\n` +
          `    ${cssSel} {\n` +
          `      /* your styles for ${element.localName} */\n` +
          `    }`;
      }
    } else {
      yaml =
        `uix:\n` +
        `  style:\n` +
        `    "${path}": |\n` +
        `      :host {\n` +
        `        /* your styles for ${element.localName} */\n` +
        `      }`;
    }
  }

  console.group("📝 Boilerplate UIX YAML");
  console.log(yaml);
  console.groupEnd();

  console.groupEnd();
};
