---
description: Learn all about styling cards.
---

# Styling cards

Cards are styled by adding the following to the card configuration:

```yaml
uix:
  style: <styles>
```

If the simplest form, `<styles>` is a string of [CSS](https://www.w3schools.com/css/) which will be injected into the appropriate element based on the card type. See [Concepts - application](../concepts/application.md) for a detailed description on where UI eXtension is applied.

!!! note
    UI eXtension only works on cards that are contained by a `<hui-card>` element, or contain a `<ha-card>` element. This includes almost every card standard Home Assistant Frontend cards, and most custom cards.

For a card contained by a `<hui-card>` element, which is almost every standard Home Assistant Frontend card, styles are injected into a shadowRoot and the bottom most element is `:host`, though in most cases the first element in the shadowRoot is `<ha-card>`. For many custom cards which do not take advantage of the modern `<hui-root>` container, but contain a `<ha-card>` element, the styles are injected into ha-card and the bottommost element is `<ha-card>`. See [Concepts - application](../concepts/application.md) for more details.

!!! tip
    Home Assistant themes makes use of [CSS variables](https://www.w3schools.com/css/css3_variables.asp). Those can both be set and used in card-mod - prepended by two dashes:
    ```yaml
    uix:
        style: |
        ha-card {
            --ha-card-background: teal;
            color: var(--primary-color);
        }
    ```
