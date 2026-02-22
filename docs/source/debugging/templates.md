# Debugging Templates

  You can debug UIX jinja2 templates by placing the comment `{# uix.debug #}` anywhere in your template. You will see debug messages on template binding, value updated, reuse, unbinding and final unsubscribing. Any template is kept subscribed in cache for a 20s cooldown period to assist with template application, which can bring a slight speed improvements when switching back and forth to views, or using the same template on cards on different views.
  