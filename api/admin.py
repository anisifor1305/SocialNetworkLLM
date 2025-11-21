from django.contrib import admin
from .models import Profile, Community, Post, Subscription, Like, Topic

admin.site.register(Profile)
admin.site.register(Community)
admin.site.register(Post)
admin.site.register(Subscription)
admin.site.register(Like)
admin.site.register(Topic)