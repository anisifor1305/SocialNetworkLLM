from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (ProfileViewSet, CommunityViewSet, PostViewSet,
                    SubscriptionViewSet, TopicViewSet, CommentViewSet, NotificationViewSet, MessageViewSet)

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'communities', CommunityViewSet)
router.register(r'posts', PostViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'topics', TopicViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]