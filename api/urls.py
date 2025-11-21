from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, CommunityViewSet, PostViewSet, SubscriptionViewSet, TopicViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'communities', CommunityViewSet)
router.register(r'posts', PostViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'topics', TopicViewSet)

urlpatterns = [
    path('', include(router.urls)),
]