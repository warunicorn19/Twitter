# Generated by Django 3.2.6 on 2021-08-16 05:48

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserInfo',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='user_info', serialize=False, to='network.user')),
                ('followers', models.ManyToManyField(related_name='user_followers', to=settings.AUTH_USER_MODEL)),
                ('following', models.ManyToManyField(related_name='user_following', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('liked', models.ManyToManyField(blank=True, related_name='liked_users', to=settings.AUTH_USER_MODEL)),
                ('poster', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_posting', to=settings.AUTH_USER_MODEL)),
                ('unliked', models.ManyToManyField(blank=True, related_name='unliked_users', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
