"""
Generates CurrencyExchangeRate objects
"""
from django.core.management import BaseCommand

from financialaid.tasks import sync_currency_exchange_rates


class Command(BaseCommand):
    """
    Generates CurrencyExchangeRate objects by calling sync_currency_exchange_rates
    """
    help = "Generates CurrencyExchangeRate objects by calling sync_currency_exchange_rates"

    def handle(self, *args, **kwargs):  # pylint: disable=unused-argument
        sync_currency_exchange_rates()
