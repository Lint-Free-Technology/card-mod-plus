# Debugging Cards

The DOM navigation can be tricky to get right the first few times, but you'll eventually get the hang of it.

To help you, you can use your browsers Element inspector to see which steps UIX takes.

- Open up the element inspector and find the base element (e.g. `#shadow-root` or card contained by `<hui-card>` or `<ha-card>` contained by a custom card or other element. See [Concepts - application](../concepts/application.md) for more details. This should contain a `<uix-node>` element whether you specified a style or not.
- Make sure the `<uix-node>` element is selected.
- Open up the browsers console (in chrome you can press Esc to open the console and inspector at the same time).
- Type in `$0.uix_input` and press enter. \
  This is the style information that step of the chain was given. If this is a string, you're at the end of the chain. If it's an object, you can move on to the next step.
- Type in `$0.uix_children` and press enter. \
  This is a set of any `<uix-node>` elements in the next step of any chain. Clicking "uix" in the `value:` of the set items will bring you to that `<uix-node>` element in the inspector, and you can keep on inspecting the rest of the chain.
- You can also use `$0.uix_parent` to find the parent of any `<uix-node>` element in a chain.

For a bit more information, you can use the following in the configuration of the card you're having problems with. It may or may not help you.

```yaml
uix:
  debug: true
```

## Setting debug via theme variables

Just like you can set debug on a card with `uix:` -> `debug: true`, you can also set debug via a theme variable. This may be the only way to debug a certain type and/or class when styling a panel that is not a Lovelace dashboard or a Lovelace strategy dashboard.

You can set debug via:

1. Using the theme variable `uix-<type>-debug: true` (defined in your theme YAML file, without the leading `--`) to debug all elements of type `<type>`. In CSS, this variable is referenced as `--uix-<type>-debug`.
2. Using the theme variable `uix-<type>-<class>-debug: true` (again, without the leading `--` in YAML) to debug all elements of type `<type>` which have class `<class>`. In CSS, reference as `--uix-<type>-<class>-debug`. These include both classes that UIX sets as well as any class you included in UIX config for a card/element.

Example:

```yaml
my-awesome-theme:
  uix-theme: my-awesome-theme

  uix-card-debug: true # Debug all elements of UIX type `card`
```

```yaml
my-awesome-theme:
  uix-theme: my-awesome-theme

  uix-card-type-energy-sankey-debug: true # Debug card which has uix class 'type-energy-sankey'
  uix-badge-my-class-debug: true # Debug badges which have my-class set by uix config
```
