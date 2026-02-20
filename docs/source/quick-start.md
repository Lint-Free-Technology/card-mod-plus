---
title: Quick Start
description: Get started using UI eXtension for Home Assistant.
---
# Quick Start

## Installation

### HACS

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Lint-Free-Technology&repository=uix&category=integration)

Install UI eXtension as a [custom HACS repository](https://www.hacs.xyz/docs/faq/custom_repositories/). Use the URL `https://github.com/Lint-Free-Technology/uix` and select `Integration`. You can do this easily in a few steps by clicking the button above.

[![Open your Home Assistant instance and show an integration.](https://my.home-assistant.io/badges/integration.svg)](https://my.home-assistant.io/redirect/integration/?domain=uix)

Once the integration is available in HACS, you need to add the UI eXtension service to Home Assistant. This is done in the `Devices & services` section of `Settings` page in Home Assistant. You can do this easily in a few steps by clicking the button above.

Once the UI eXtension service has been added, refresh the page to make the Frontend resource available.

### Manual

Use your favorite method of access Home Assistant configuration files. Add `uix` folder to `custom_components`. Copy all files in [custom_components/uix](https://github.com/Lint-Free-Technology/uix/tree/master/custom_components/uix) to the `uix` folder.

## Your First UIX

- Open your card in the Home Assistant GUI editor
- Click the `Show code editor` button at the bottom of the edit dialog
- Add the following to the bottom of yaml code:

```yaml
uix:
  style: |
    ha-card {
      background: red;
    }
```

You should see the background of the card turn red as you type. You should also see a little brush icon popping up near the `Show visual editor` button. This indicates that this card has UIX code which will not be shown in the visual editor.

![Quick Start](./assets/page-assets/quick-start/quick-start-1-light.png#only-light){: width="400"}
![Quick Start](./assets/page-assets/quick-start/quick-start-1-dark.png#only-dark){: width="400"}
