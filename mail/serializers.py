"""
Serializers for mail
"""

from rest_framework import (
    fields,
    serializers
)


class GenericMailSerializer(serializers.Serializer):
    """
    Serializer for generic email requests
    """
    email_subject = fields.CharField(label="Email Subject")
    email_body = fields.CharField(label="Email Body", style={"base_template": "textarea.html"})
