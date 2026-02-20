# FAQ

## Is UI eXtension a drop in replacement for Card-mod?

Yes, UI eXtension is a drop in replacement for Card-mod versions up to 4.2.1. All Card-mod card and themes configurations are supported. While you are encouraged to update to use `uix:` in your cards and `uix-<thing>(-yaml)` for your themes, it is not required.

## Is UI eXtension card Card-mod with different documentation?

No, UI eXtension code has been updated so that UIX is primary domain and config key.

!!! note "UI eXtension differences from Card-mod"
    - Config key for cards is `uix:`. `card_mod:` is supported but is overridden by `uix:`.
    - Theme key is `uix-theme:`. `card-mod-theme:` is supported but is overridden by `uix-theme:`.
    - Theme `thing` keys are `uix-<thing>(-yaml):`. `card-mod-<thing>(-yaml):` is supported but is overridden by `uix-<thing>(-yaml):`.
    - HTML node for UI eXtension is `<uix-node>` and properties of the node all refer to `uix` and not `card-mod`.
    - All debug console messages will start with `UIX`.

## Does UI eXtension have resource URL issues?

No, being an integration, UI eXtension manages its resource URLs directly. You don't need to do anything to have UI eXtension run at peak performance. UI eXtension dynamically adds its Fronted resource, `uix.js`, as an extra module, as well as adding a Dashboard resource in case you use CAST. UI eXtension will add its version to these resources automatically each time the integration loads.

## Does UI eXtension need manual cache clear after upgrade for Browsers and device Companion Apps?

UI eXtension will show a toast message when it detects that a reload is needed to clear caches, with a convenient `Reload` button.

## How do I uninstall UI eXtension?

Uninstallation of UI eXtensions is a two step process. First, remove the service entry in Devices & services. Next uninstall the integration either HACS or manually removing the `uix` folder from `custom_components` directory.
