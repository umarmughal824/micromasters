"""
cms custom filters
"""
from six.moves.html_parser import HTMLParser
from django import template
from django.utils.safestring import mark_safe

from wagtail.core.rich_text import RichText, expand_db_html

register = template.Library()


@register.filter
def richtext_description(value):
    """
    enables raw html on wagtail rich text
    """
    if isinstance(value, RichText):
        # passing a RichText value through the |richtext filter should have no effect
        return value
    elif value is None:
        html = ''
    else:
        html = expand_db_html(value)

    return mark_safe('<div class="rich-text">' + HTMLParser().unescape(html) + '</div>')
