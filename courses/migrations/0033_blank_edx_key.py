# Generated by Django 2.1.10 on 2019-09-12 20:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0032_add_course_edx_key'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='edx_key',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]