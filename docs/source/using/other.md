---
description: Learn about other styling techniques including using mod-card for troublesome custom cards.
---
# Other styling

Cards that don't have a `<ha-element>` can still be styled by using the supplied `custom:mod-card` card. This is only necessary in **very very few** instances, and likely to bring more problems than it solves. Most likely your card contains another card, in which case **that** is the one you should apply the styles to.

??? warning "Use custom:mod-card with caution"
    ```yaml
    type: custom:mod-card
    card:
      type: custom:beloved-custom-card
      ...
    uix:
      style: |
        ha-card {
          ...
        }
    ```
    The mod-card will create a `<ha-card>` element and put your card inside that. The card will be styled transparent with no border or background.
