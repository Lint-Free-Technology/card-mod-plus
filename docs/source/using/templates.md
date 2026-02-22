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
  