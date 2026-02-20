import logging
from homeassistant.core import HomeAssistant, callback
from homeassistant.components.websocket_api import (
    event_message,
    async_register_command,
)
from homeassistant.components import websocket_api
import voluptuous as vol

from .helpers import get_version
from .const import (
    WS_CONNECT, 
    WS_LOG
)

_LOGGER = logging.getLogger(__name__)

async def async_setup_connection(hass: HomeAssistant) -> None:
    version = await hass.async_add_executor_job(get_version, hass)

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_CONNECT,
        }
    )
    @websocket_api.async_response
    async def handle_connect(hass: HomeAssistant, connection, msg):
        """Handle a connection request."""

        @callback
        def send_update(data):
            data['version'] = version
            connection.send_message(event_message(msg["id"], {"result": data}))

        def close_connection():
            pass

        connection.send_result(msg["id"])

        send_update({})
    
    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_LOG,
            vol.Required("message"): str,
        }
    )
    def handle_log(hass, connection, msg):
        """Print a debug message."""
        _LOGGER.info(f"LOG MESSAGE: {msg['message']}")
    
    async_register_command(hass, handle_connect)
    async_register_command(hass, handle_log)