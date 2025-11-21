from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Community, Subscription, Post


# для отображения не айди, а красиво юзера
class UserShortSerializer(serializers.ModelSerializer):

    avatar = serializers.ImageField(source='profile.avatar', read_only=True)
    status = serializers.CharField(source='profile.status', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'status']



class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Profile
        fields = ['id', 'username', 'bio', 'avatar', 'status']


class CommunitySerializer(serializers.ModelSerializer):
    creator = UserShortSerializer(read_only=True)
    members = UserShortSerializer(many=True, read_only=True)
    members_count = serializers.IntegerField(source='members.count', read_only=True)

    class Meta:
        model = Community
        fields = ['id', 'title', 'description', 'avatar', 'created_at', 'creator', 'members', 'members_count']


class SubscriptionSerializer(serializers.ModelSerializer):
    subscriber = UserShortSerializer(read_only=True)
    target_user = UserShortSerializer(read_only=True)

    target_user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='target_user', write_only=True
    )

    class Meta:
        model = Subscription
        fields = ['id', 'subscriber', 'target_user', 'target_user_id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    community_title = serializers.ReadOnlyField(source='community.title')

    class Meta:
        model = Post
        fields = ['id', 'text', 'image', 'created_at', 'author', 'community', 'community_title', 'is_published']
        # community оставляем как ID, чтобы при создании поста можно было указать id группы
        read_only_fields = ['is_published']