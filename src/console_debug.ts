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
// The "UIX context" for a parent element is its shadow root when present,
// otherwise the element itself.  Paths in selectTree are relative to this.
// ---------------------------------------------------------------------------

function uixContext(uixParentEl: Element): Element | ShadowRoot {
  return uixParentEl.shadowRoot ?? uixParentEl;
}

// ---------------------------------------------------------------------------
// Build the UIX YAML path key and matching CSS selector for a target element.
//
// The path KEY stops at the last shadow-root crossing (ends with "$"), so the
// CSS value injected at that key can target the element using a plain selector.
// When no shadow root is crossed between the UIX parent context and the target,
// the key is "." (the UIX parent itself) and the CSS selector covers the full
// element chain from that context.
// ---------------------------------------------------------------------------

interface PathAndSelector {
  /** YAML path key – ends at the last shadow-root boundary or "." */
  pathKey: string;
  /** CSS selector to use inside the style string at pathKey */
  cssSelector: string;
}

function buildPathKeyAndCssSelector(
  uixParentEl: Element,
  targetEl: Element
): PathAndSelector | null {
  if (targetEl === uixParentEl) {
    return { pathKey: ".", cssSelector: ":host" };
  }

  const ctx = uixContext(uixParentEl);
  type Segment = { kind: "element"; sel: string } | { kind: "shadow" };
  const segments: Segment[] = [];
  let current: Node = targetEl;

  while (current && current !== ctx && current !== uixParentEl) {
    if (current instanceof ShadowRoot) {
      segments.unshift({ kind: "shadow" });
      current = current.host;
    } else if (current instanceof Element) {
      if (current.localName !== "uix-node") {
        segments.unshift({ kind: "element", sel: buildSelector(current) });
      }
      current = current.parentNode ?? null;
    } else {
      current = (current as any).parentNode ?? null;
    }
  }

  if (current !== ctx && current !== uixParentEl) return null;

  // Find the last shadow-root crossing in the walk
  let lastShadowIdx = -1;
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i].kind === "shadow") {
      lastShadowIdx = i;
      break;
    }
  }

  if (lastShadowIdx === -1) {
    // No shadow crossing – use "." as the key; CSS targets the element directly
    const cssSelector =
      segments
        .filter((s): s is { kind: "element"; sel: string } => s.kind === "element")
        .map((s) => s.sel)
        .join(" ")
        .trim() || targetEl.localName;
    return { pathKey: ".", cssSelector };
  }

  // Path key: everything up to and including the last "$"
  const keyParts: string[] = [];
  for (let i = 0; i <= lastShadowIdx; i++) {
    const seg = segments[i];
    keyParts.push(seg.kind === "element" ? seg.sel : "$");
  }
  const pathKey = keyParts.join(" ").trim();

  // CSS selector: the element chain after the last "$"
  const afterShadow = segments.slice(lastShadowIdx + 1);
  const cssSelector =
    afterShadow
      .filter((s): s is { kind: "element"; sel: string } => s.kind === "element")
      .map((s) => s.sel)
      .join(" ")
      .trim() || targetEl.localName;

  return { pathKey, cssSelector };
}

// ---------------------------------------------------------------------------
// Collect all style groups reachable from the UIX parent context, up to
// (but not including) the next UIX parent boundary.
//
// Each group corresponds to a YAML path key (stopping at the last shadow-root
// crossing, i.e. ending with "$", or "." for the root context).  The selectors
// in the group are valid CSS within the style string for that key.
// ---------------------------------------------------------------------------

interface StyleGroup {
  /** YAML path key – ends at the last shadow-root boundary or "." */
  pathKey: string;
  /** CSS selectors available within that shadow context */
  cssSelectors: string[];
}

// Limit traversal depth to avoid spending excessive time on deeply-nested
// shadow DOM trees while still covering the most common two-to-three level
// hierarchies found in Home Assistant cards.
const MAX_TRAVERSAL_DEPTH = 6;

function collectSubtreeGroups(uixParentEl: Element): StyleGroup[] {
  // Preserve insertion order so groups appear top-down as encountered.
  const groups = new Map<string, string[]>();
  const visited = new WeakSet<Element>();

  function getGroup(pathKey: string): string[] {
    let group = groups.get(pathKey);
    if (!group) {
      group = [];
      groups.set(pathKey, group);
    }
    return group;
  }

  /**
   * @param node        - current DOM node being iterated
   * @param shadowParts - path segments that form the path KEY (up to + incl. last "$")
   * @param cssParts    - CSS selector parts within the current shadow context
   * @param depth       - recursion guard
   */
  function traverse(
    node: Element | ShadowRoot,
    shadowParts: string[],
    cssParts: string[],
    depth: number
  ) {
    if (depth > MAX_TRAVERSAL_DEPTH) return;
    for (const child of Array.from((node as ParentNode).children ?? [])) {
      if (child.localName === "uix-node") continue;
      if (child.localName === "style") continue;
      if (visited.has(child)) continue;
      visited.add(child);

      const sel = buildSelector(child);
      const newCssParts = [...cssParts, sel];
      const pathKey = shadowParts.join(" ").trim() || ".";
      getGroup(pathKey).push(newCssParts.join(" ").trim());

      // Do not descend into another UIX parent (different styling boundary)
      const isNextUixParent = ((child as any)._uix ?? []).some(
        (u: any) => u.type && !u.type.endsWith("-child")
      );
      if (!isNextUixParent) {
        if (child.shadowRoot) {
          // Entering a shadow root: new path key includes everything up to "$"
          const newShadowParts = [...shadowParts, ...newCssParts, "$"];
          traverse(child.shadowRoot, newShadowParts, [], depth + 1);
        }
        traverse(child, shadowParts, newCssParts, depth + 1);
      }
    }
  }

  traverse(uixContext(uixParentEl), [], [], 0);
  return Array.from(groups.entries()).map(([pathKey, cssSelectors]) => ({
    pathKey,
    cssSelectors,
  }));
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
  const groups = collectSubtreeGroups(parent.element);
  const totalSelectors = groups.reduce((n, g) => n + g.cssSelectors.length, 0);
  const pl = (n: number, word: string) => `${n} ${word}${n !== 1 ? "s" : ""}`;
  console.group(
    `🗺️ Available Style Paths  (${pl(groups.length, "shadow context")}, ${pl(totalSelectors, "selector")})`
  );
  console.log(
    "Each group is a YAML path key; selectors inside are valid CSS within that key's style string:"
  );
  for (const { pathKey, cssSelectors } of groups) {
    console.groupCollapsed(`"${pathKey}"  (${pl(cssSelectors.length, "selector")})`);
    cssSelectors.forEach((s) => console.log(`  ${s}`));
    console.groupEnd();
  }
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

  // --- Path key and CSS selector ---
  const result = buildPathKeyAndCssSelector(parent.element, element);
  if (result === null) {
    console.warn(
      "Could not build a path: the element may not be a descendant of the UIX parent."
    );
    console.groupEnd();
    return;
  }

  const { pathKey, cssSelector } = result;

  console.group("📍 UIX Path to Target");
  console.log("Path:", `"${pathKey}"`);
  console.groupEnd();

  // --- CSS target info ---
  console.group("🎨 CSS Target");
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
  console.log("Suggested CSS selector:", cssSelector);
  console.groupEnd();

  // --- Boilerplate YAML ---
  let yaml: string;
  if (pathKey === ".") {
    yaml =
      `uix:\n` +
      `  style: |\n` +
      `    ${cssSelector} {\n` +
      `      /* your styles for ${element.localName} */\n` +
      `    }`;
  } else {
    yaml =
      `uix:\n` +
      `  style:\n` +
      `    "${pathKey}": |\n` +
      `      ${cssSelector} {\n` +
      `        /* your styles for ${element.localName} */\n` +
      `      }`;
  }

  console.group("📝 Boilerplate UIX YAML");
  console.log(yaml);
  console.groupEnd();

  console.groupEnd();
};
