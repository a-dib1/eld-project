# Generated by Django 4.2.20 on 2025-03-07 10:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_alter_logsheet_currentcycleused'),
    ]

    operations = [
        migrations.AlterField(
            model_name='logsheet',
            name='currentCycleUsed',
            field=models.CharField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='logsheet',
            name='pickup',
            field=models.CharField(max_length=150, null=True),
        ),
        migrations.AlterField(
            model_name='trip',
            name='cycleUsed',
            field=models.CharField(max_length=150, null=True),
        ),
        migrations.AlterField(
            model_name='trip',
            name='instructions',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='trip',
            name='pickup',
            field=models.CharField(max_length=150, null=True),
        ),
    ]
