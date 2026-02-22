---
description: Learn all about styling icons including change icons and their color.
---
# Styling icons

With UI eXtension installed, the `<ha-icon>` element - used e.g. by `entities`, `glance` and many more cards - will set it's icon to the value found in the CSS variable `--uix-icon` (if present).

It will also set the icon color to the value found in the CSS variable `--uix-icon-color` if present. This ignores entity state, but will still dim unless you also set `--uix-icon-dim` to `none`.

```yaml
- entity: light.bed_light
  uix:
    style: |
      :host {
        --card-mod-icon: mdi:bed;
      }
```
