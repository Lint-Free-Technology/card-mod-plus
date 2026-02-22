---
title: Clearing cache
---
# Clearing Home Assistant Frontend application cache

If at any time you need to clear the Home Assistant Application cache, which is used in addition to Browser cache, you can use a custom action to clear the Home Assistant Application cache and reload the Browser. This can be very convenient especially for devices where the option is hidden in a debugging menu and will clear more than just the application cache (e.g. localStorage which clears out many stored items like Browser Mod Browser ID).

The action can be executed using `fire-dom-event` with key `uix:` with `action: clear_cache`. This can be used on any card that supports the `fire-dom-event` action which includes all standard Home Assistant cards.

Example button to clear cache and reload.

```yaml
show_name: true
show_icon: true
type: button
name: Clear Frontend Cache
tap_action:
  action: fire-dom-event
  uix:
    action: clear_cache
```
