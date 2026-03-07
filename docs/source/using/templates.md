---
description: Learn all about using templates.
---
# Templates

All styles may contain [jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/) that will be processed by the Home Assistant backend.

UI eXtension also makes the following variables available for templates:

- `config` - The entire configuration of the card, entity or badge - (`config.entity` may be of special interest)
- `user` - The name of the currently logged in user
- `browser` - The `browser_id` of your browser, if you have [browser_mod](https://github.com/thomasloven/hass-browser_mod) installed
- `hash` - Whatever comes after `#` in the current URL. UIX watches for location changes through `location-changed` and `popstate` events so templates will be rebound with the updated `hash`
- `panel` - various information about the panel in view, be it a lovelace dashboard or another panel view. `panel` is a dictionary containing the following panel attributes with example values shown.
  - `panel.fullUrlPath`: "uix/another-test-view"
  - `panel.panelComponentName`: "lovelace"
  - `panel.panelIcon`: "mdi:card-bulleted-outline"
  - `panel.panelNarrow`: true
  - `panel.panelRequireAdmin`: false
  - `panel.panelTitle`: "UIX"
  - `panel.panelUrlPath`: uix"
  - `panel.panelTitle`: "UIX - Test View"
  - `panel.viewNarrow`: true
  - `panel.viewTitle`: "Test View"
  - `panel.viewUrlPath`: "another-test-view"

  You can debug UIX jinja2 templates by placing the comment `{# uix.debug #}` anywhere in your template. You will see debug messages on template binding, value updated, reuse, unbinding and final unsubscribing. Any template is kept subscribed in cache for a 20s cooldown period to assist with template application, which can bring a slight speed improvements when switching back and forth to views, or using the same template on cards on different views.

## Macros

UI eXtension supports reusable [Jinja2 macros](https://jinja.palletsprojects.com/en/stable/templates/#macros) that can be defined at card level or via a theme, and are prepended to every template in the card.

### Defining macros on a card

Macros are defined under `uix.macros` in the card configuration. A macro without `returns` renders its template inline as a string — use this when you want to substitute a text value (such as a CSS color or icon name) directly into the template:

```yaml
type: tile
entity: light.living_room
uix:
  macros:
    state_color:
      params:
        - entity_id
      template: "{{ 'yellow' if states(entity_id) == 'on' else 'gray' }}"
  style: |
    ha-card {
      background: {{ state_color(config.entity) }};
    }
```

Each macro entry supports the following keys:

| Key | Required | Description |
|-----|----------|-------------|
| `template` | Yes | The Jinja2 template body of the macro. |
| `params` | No | A list of parameter names the macro accepts. |
| `returns` | No | Set to `true` to make the macro callable as a function using Home Assistant's `as_function` filter. When `true`, use `{%- do returns(<value>) -%}` inside the template to return a typed value (boolean, number, etc.). |

### Macros with `returns`

When a macro renders inline (no `returns`), its output is always a string — even `{{ states(entity_id) == 'on' }}` produces the string `"True"` or `"False"`, and any non-empty string is truthy in Jinja2. To return an actual boolean or numeric value that behaves correctly in conditionals and comparisons, use `returns: true`.

When `returns: true`, the macro follows Home Assistant's [`as_function`](https://www.home-assistant.io/docs/configuration/templating/#as_function) convention: the macro is internally named `macro_<name>` and exposed as `<name>` so it can be called as a regular function returning the value passed to `do returns(...)`:

```yaml
type: tile
entity: light.living_room
uix:
  macros:
    is_on:
      params:
        - entity_id
      returns: true
      template: "{%- do returns(states(entity_id) == 'on') -%}"
  style: |
    ha-card {
      --tile-color: {{ 'yellow' if is_on(config.entity) else 'gray' }};
    }
```

This generates the following Jinja2 block that is prepended to every template:

```jinja
{% macro macro_is_on(entity_id) %}{%- do returns(states(entity_id) == 'on') -%}{% endmacro %}
{% set is_on = macro_is_on | as_function %}
```

### Theme macros

Macros can also be defined in a theme so they are available to all cards that use it. See [Themes - Macros](themes.md#macros) for details.

Card-level macros take precedence over theme macros of the same name, allowing individual cards to override theme-defined macros.
  