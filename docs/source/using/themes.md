# Themes

!!! info "Theme variable"
    The theme MUST define a variable `card-mod-theme` which MUST have the same value as the name of the theme. For example:
    ```yaml
    my-awesome-theme:
        uix-theme: my-awesome-theme

        ... other theme variables go here ...
    ```

## Theme variables

- `card-mod-card`
- `card-mod-row`
- `card-mod-glance`
- `card-mod-badge`
- `card-mod-heading-badge`
- `card-mod-assist-chip`
- `card-mod-element`

- `card-mod-root`
- `card-mod-view`
- `card-mod-more-info`
- `card-mod-sidebar`
- `card-mod-config`
- `card-mod-panel-custom`
- `card-mod-top-app-bar-fixed`
- `card-mod-dialog`

Also `<any variable>-yaml`.

## Classes

Set a class with:
    ```yaml
    uix:
        class: red
    ```
