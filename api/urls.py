from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, CommunityViewSet, PostViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'communities', CommunityViewSet)
router.register(r'posts', PostViewSet)
router.register(r'subscriptions', SubscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]