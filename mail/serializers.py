"""
Serializers for mail
"""

from rest_framework import (
    fields,
    serializers
)
from mail.models import AutomaticEmail


class GenericMailSerializer(serializers.Serializer):
    """
    Serializer for generic email requests
    """
    email_subject = fields.CharField(label="Email Subject")
    email_body = fields.CharField(label="Email Body", style={"base_template": "textarea.html"})


class AutomaticEmailSerializer(serializers.ModelSerializer):
    """
    AutomaticEmailSerializer
    """
    class Meta:
        model = AutomaticEmail
        fields = (
            'enabled',
            'email_subject',
            'email_body',
            'sender_name',
            'id'
        )
