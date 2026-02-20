from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .checks import (
    check_card_mod_frontend_script_extra_module, 
    check_card_mod_frontend_script_resource
)
from .const import (
    DOMAIN, 
    NAME, 
    CARD_MOD_FRONTEND_SCRIPT_URL
)

class CardModPlusConfigFlow(ConfigFlow, domain=DOMAIN):

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the config flow."""

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        
        if self.hass.data.get(DOMAIN):
            return self.async_abort(reason="single_instance_allowed")
        
        if await check_card_mod_frontend_script_resource(self.hass):
            return self.async_abort(
                reason="old_frontend_script_resource",
                description_placeholders={"resource": CARD_MOD_FRONTEND_SCRIPT_URL},
            )
        
        if await check_card_mod_frontend_script_extra_module(self.hass):
            return self.async_abort(
                reason="old_frontend_script_extra_module",
                description_placeholders={"resource": CARD_MOD_FRONTEND_SCRIPT_URL},
            )
        
        return self.async_create_entry(
            title=NAME,
            data={},
            description="refresh_message",
        )