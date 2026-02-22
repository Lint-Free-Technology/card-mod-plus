---
description: Learn all about styling entities, badges and elements.
---
# Styling entities, badges and elements

In `entities` and `glance` cards, [each entity can have options](https://www.home-assistant.io/lovelace/entities/#options-for-entities). Those elements can be styled individually by adding a `uix` parameter to the entity configuration.

For those cases, the styles are injected into a shadowRoot, and the bottommost element is thus accessed through `:host`.

This also applies to view badges and elements in `picture-elements` cards.

```yaml
type: entities
entities:
  - entity: light.bed_light
    uix:
      style: |
        :host {
          color: red;
          }
  - entity: light.ceiling_lights
    uix:
      style: |
        :host {
          color: green;
        }
  - entity: light.kitchen_lights
    uix:
      style: |
        :host {
          color: blue;
        }
```

## Styling entities conditional rows

Rows in entities conditional rows can be styled directly. If you style the conditional config itself, you need to take care as the conditional row wrapper is not in a shadowRoot so styles may leak to other rows/elements.

??? example "Conditional row examples"
    Styling a conditional row directly. Only the entity row.
    ```yaml
    type: entities
    state_color: true
    entities:
    - type: conditional
      conditions:
        - condition: state
          entity: input_boolean.test_boolean
          state: "off"
        row:
        entity: sun.sun
        name: Conditional Sun
        uix:
          style: |
            :host {
                color: red;
            }
    ```
    Styling a conditional row config using shadowRoot. This method is available for legacy configurations.
    ```yaml
    type: entities
    state_color: true
    entities:
      - type: conditional
        conditions:
          - condition: state
            entity: input_boolean.test_boolean
            state: "on"
        row:
          entity: sun.sun
          name: Conditional Sun
          uix:
            style:
              hui-simple-entity-row $ hui-generic-entity-row $: |
                .row {
                  color: red;
                }
    ```
    Styling a conditional config where styles will 'leak' to all rows.
    ```yaml
    type: entities
    state_color: true
    entities:
      - type: conditional
        conditions:
          - condition: state
            entity: input_boolean.test_boolean
            state: "on"
        row:
          entity: sun.sun
          name: Conditional Sun
          uix:
            style: |
              :host {
                --primary-text-color: red;
              }
    ```

## Styling picture-elements conditional elements

The elements in a picture-elements conditional element can be styled directly. If you style the conditional config itself, you need to take care as the conditional element wrapper is not in a shadowRoot so styles may leak to other rows/elements.

??? example "Conditional picture-elements example"
    Styling a conditional element directly. Only the element.
    ```yaml
    type: picture-elements
    image:
      media_content_id: https://demo.home-assistant.io/stub_config/t-shirt-promo.png
    elements:
      - type: conditional
        conditions:
          - entity: input_boolean.test_boolean
            state: "on"
        elements:
          - type: state-badge
            entity: sun.sun
            style:
              left: 25%
              top: 25%
            uix:
              style: |
                :host {
                  color: green;
                }
    ```
    Styling the conditional config. This method is available for legacy configurations.
    ```yaml
    type: picture-elements
    image:
      media_content_id: https://demo.home-assistant.io/stub_config/t-shirt-promo.png
    elements:
      - type: conditional
        conditions:
          - entity: input_boolean.test_boolean
            state: "on"
        elements:
          - type: state-badge
            entity: sun.sun
            style:
              left: 25%
              top: 25%
        uix:
          style:
            hui-state-badge-element $ ha-state-label-badge $: |
              :host {
                color: red;
              }
    ```
    Styling the conditional config where styles will 'leak' to all elements.
    ```yaml
    type: picture-elements
    image:
      media_content_id: https://demo.home-assistant.io/stub_config/t-shirt-promo.png
    elements:
      - type: conditional
        conditions:
          - entity: input_boolean.test_boolean
            state: "on"
        elements:
          - type: state-badge
            entity: sun.sun
            style:
              left: 25%
              top: 25%
        uix:
          style: |
            :host {
              --primary-text-color: purple;
            }
    ```
