from django.contrib import admin

from .models import User, UserInfo, Post

# Register your models here.
admin.site.register(User)
admin.site.register(UserInfo)
admin.site.register(Post)
