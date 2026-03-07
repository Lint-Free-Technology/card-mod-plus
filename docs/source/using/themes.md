# Themes

!!! info "Theme variable"
    The theme MUST define a variable `uix-theme` which MUST have the same value as the name of the theme. For example:
    ```yaml
    my-awesome-theme:
        uix-theme: my-awesome-theme

        ... other theme variables go here ...
    ```

## Theme variables

- `uix-card`
- `uix-row`
- `uix-glance`
- `uix-badge`
- `uix-heading-badge`
- `uix-assist-chip`
- `uix-element`

- `uix-root`
- `uix-view`
- `uix-more-info`
- `uix-sidebar`
- `uix-config`
- `uix-panel-custom`
- `uix-top-app-bar-fixed`
- `uix-dialog`

Also `<any variable>-yaml`.

## Macros

Themes can define reusable [Jinja2](https://www.home-assistant.io/docs/configuration/templating/) macros that are available to all cards using the theme. Macros are defined under the `uix-macros-yaml` theme key.

```yaml
my-awesome-theme:
    uix-theme: my-awesome-theme

    uix-macros-yaml: |
      is_on:
        params:
          - entity_id
        template: "{{ states(entity_id) == 'on' }}"

      badge_color:
        params:
          - entity_id
          - color_on
          - color_off
        template: "{{ color_on if states(entity_id) == 'on' else color_off }}"
```

Each macro entry supports the following keys:

| Key | Required | Description |
|-----|----------|-------------|
| `template` | Yes | The Jinja2 template body of the macro. |
| `params` | No | A list of parameter names the macro accepts. |
| `returns` | No | Set to `true` to make the macro callable as a function using Home Assistant's `as_function` filter. When `true`, use `{%- do returns(<value>) -%}` inside the template to return a value. |

### Macros with `returns`

When `returns: true`, the macro is defined using Home Assistant's [`as_function`](https://www.home-assistant.io/docs/configuration/templating/#as_function) convention: the macro is internally named `macro_<name>` and exposed as `<name>` so it can be called like a regular function (e.g. `{{ is_on(entity_id) }}`).

```yaml
uix-macros-yaml: |
  is_on:
    params:
      - entity_id
    returns: true
    template: "{%- do returns(states(entity_id) == 'on') -%}"
```

This generates:
```jinja
{% macro macro_is_on(entity_id) %}{%- do returns(states(entity_id) == 'on') -%}{% endmacro %}
{% set is_on = macro_is_on | as_function %}
```

### Card-level macros

Cards can also define their own macros under `uix.macros`. Card-level macros take precedence over theme macros of the same name, allowing individual cards to override or extend theme-defined macros.

```yaml
type: tile
entity: light.living_room
uix:
  macros:
    my_color:
      params:
        - entity_id
      returns: true
      template: "{%- do returns('red' if states(entity_id) == 'on' else 'gray') -%}"
  style: |
    ha-card {
      --tile-color: {{ my_color(config.entity) }};
    }
```

## Classes

Set a class with:
    ```yaml
    uix:
      class: red
    ```
