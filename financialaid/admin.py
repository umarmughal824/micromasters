"""
Admin views for Financial Aid app
"""

from django.contrib import admin

from financialaid.models import (
    Coupon,
    Document,
    FinancialAid,
    FinancialAidAudit,
    TierProgram,
    Tier,
)


class CouponAdmin(admin.ModelAdmin):
    """Admin for Coupon"""
    model = Coupon


class DocumentAdmin(admin.ModelAdmin):
    """Admin for Document"""
    model = Document


class FinancialAidAdmin(admin.ModelAdmin):
    """Admin for FinancialAid"""
    model = FinancialAid


class FinancialAidAuditAdmin(admin.ModelAdmin):
    """Admin for FinancialAidAudit"""
    model = FinancialAidAudit

    def has_add_permission(self, *args, **kwargs):  # pylint: disable=unused-argument
        return False

    def has_delete_permission(self, *args, **kwargs):  # pylint: disable=unused-argument
        return False


class TierProgramAdmin(admin.ModelAdmin):
    """Admin for TierProgram"""
    model = TierProgram


class TierAdmin(admin.ModelAdmin):
    """Admin for Tier"""
    model = Tier

admin.site.register(Coupon, CouponAdmin)
admin.site.register(Document, DocumentAdmin)
admin.site.register(FinancialAid, FinancialAidAdmin)
admin.site.register(FinancialAidAudit, FinancialAidAuditAdmin)
admin.site.register(TierProgram, TierProgramAdmin)
admin.site.register(Tier, TierAdmin)
