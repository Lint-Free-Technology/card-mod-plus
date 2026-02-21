# DOM navigation

Home Assistant makes extensive use of concept called [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM). This allows for easy reuse of components (such as `<ha-card>` or `<ha-icon>`) but requires some advanced techniques when applying CSS styles to elements.

When exploring cards in your browsers element inspector, you may have come across a line that says something like `#shadow-root (open)` (exactly what it says depends on your browser) and have noticed that elements inside that does not inherit the styles from outside.

In order to style elements inside a `#shadow-root`, you will need to make your `style:` a dictionary rather than a string.

For each dictionary entry the key will be used to select one or several elements through a modified [`querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) function. The value of the entry will then be injected into those elements.

!!! tip
    The modified `querySelector()` function will replace a dollar sign `$` with a `#shadow-root` in the selector.

The process is recursive, so the value may also be a dictionary. A key of `.` (a period) will select the current element.

??? example
    Let's change the color of all third level titles `### like this` in a markdown card, and also change the card's background.
    ```yaml
    type: markdown
    content: |-
        # Example
        ## A teal markdown card where h3 tags are purple
        ### Like this
    ```

    In the element inspector of chrome, the HTML will be similar to the image below.

    ![markdown-card-dom](../assets/page-assets/concepts/dom-1-light.png#only-light){: width="400" }
    ![markdown-card-dom](../assets/page-assets/concepts/dom-1-dark.png#only-dark){: width="400" }

    The `<ha-card>` element is the base, and from there we see that we need to go through one `#shadow-root` to reach the `<h3>`. That `#shadow-root` is inside an `<ha-markdown>` element, so our selector will be:
    ```yaml
      ha-markdown $:
    ```
    which will find the first `<ha-markdown>` element and then all `#shadow-root`s inside that.

    To add the background to the `<ha-card>`, we want to apply the styles to the base element directly, which has the key

    ```yaml
      .:
    ```

    This gives the final style:

    ```yaml
    uix:
      style:
        ha-markdown$: |
          h3 {
            color: purple;
          }
        .: |
          ha-card {
            background: teal;
          }
    ```

    ![DOM-navigation](../assets/page-assets/concepts/dom-2.png){: width="400"}

The selector chain of the queue will look for one element at a time separated by spaces or `$`. For each step, only the first match will be selected. But for the final selector of the chain (i.e. in a given dictionary key) **all** matching elements will be selected.

Chains ending with `$` is a special case for convenience, selecting the shadow roots of all elements.

!!! example "Chaining example"
    The following will select the `div` elements in the first marker on a map card:
    ```yaml
      ha-map $ ha-entity-marker $ div: |
    ```
    But the following will select the div elements in all map markers on a map card (because we end the first key on the `ha-entity-marker $` selector and start a new search within each result for `div`):
    ```yaml
      ha-map $ ha-entity-marker $:
        div: |
    ```

!!! warning "Load order optimization"
    Following on the note above, due to the high level of load order optimization used in Home Assistant, it is not guaranteed that the `ha-entity-marker` elements exist at the time when UIX is looking for them.

    If you break the chain once more:
    ```yaml
      ha-map $:
        ha-entity-marker $:
          div: |
    ```
    then UIX will be able to retry looking from the `ha-map $` point at a later time, which may lead to more stable results.

    In short, if things seem to be working intermittently, then try splitting up the chain into several steps.
