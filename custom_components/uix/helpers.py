import json
from homeassistant.core import HomeAssistant

from .const import DOMAIN

def get_version(hass: HomeAssistant):
    with open(hass.config.path(f"custom_components/{DOMAIN}/manifest.json"), "r") as fp:
        manifest = json.load(fp)
        return manifest["version"]
