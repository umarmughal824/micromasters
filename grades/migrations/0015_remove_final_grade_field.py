# Generated by Django 2.0.2 on 2018-04-17 19:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('grades', '0014_remove_micromasterscoursecertificate_final_grade'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='micromasterscoursecertificate',
            name='final_grade',
        )
    ]