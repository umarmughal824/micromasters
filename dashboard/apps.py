"""
AppConfig
"""
from django.apps import AppConfig


class DashboardConfig(AppConfig):
    """
    App config for this app
    """
    name = "dashboard"

    def ready(self):
        """
        Ready handler. Import signals.
        """
        import dashboard.signals
