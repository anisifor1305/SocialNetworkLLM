from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Community, Subscription, Post, Like, Topic
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer

# для отображения не айди, а красиво юзера
class UserShortSerializer(serializers.ModelSerializer):

    avatar = serializers.ImageField(source='profile.avatar', read_only=True)
    status = serializers.CharField(source='profile.status', read_only=True)

    nickname = serializers.CharField(source='profile.nickname', read_only=True)
    handle = serializers.CharField(source='username', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'handle', 'nickname', 'avatar', 'status']


class CustomUserCreateSerializer(BaseUserCreateSerializer):
    nickname = serializers.CharField(required=True, write_only=True)

    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'username', 'password', 'nickname')

    # --- 1. ДОБАВЛЯЕМ ЭТОТ МЕТОД ---
    def validate(self, attrs):
        # Вырезаем nickname перед тем, как отдать данные Djoser-у
        # (чтобы он не пытался запихнуть его в модель User при проверке)
        nickname = attrs.pop('nickname', None)

        # Запускаем стандартную проверку Djoser (пароль и т.д.)
        attrs = super().validate(attrs)

        # Возвращаем nickname обратно, чтобы он дошел до метода create
        if nickname:
            attrs['nickname'] = nickname

        return attrs

    def create(self, validated_data):
        nickname = validated_data.pop('nickname')

        user = super().create(validated_data)

        user.profile.nickname = nickname
        user.profile.save()

        return user


class ProfileSerializer(serializers.ModelSerializer):
    handle = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Profile
        fields = ['id', 'handle', 'nickname', 'email', 'bio', 'avatar', 'status']


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name']


class CommunitySerializer(serializers.ModelSerializer):
    creator = UserShortSerializer(read_only=True)
    members = UserShortSerializer(many=True, read_only=True)
    members_count = serializers.IntegerField(source='members.count', read_only=True)

    topic = serializers.StringRelatedField(read_only=True)

    topic_id = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(), source='topic', write_only=True
    )

    class Meta:
        model = Community
        fields = ['id', 'title', 'description', 'avatar', 'topic', 'topic_id', 'created_at', 'creator', 'members', 'members_count']


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

    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()  # Вычисляемое поле

    class Meta:
        model = Post
        fields = ['id', 'text', 'image', 'created_at',
                  'author', 'community', 'community_title',
                  'is_published', 'is_liked', 'likes_count']
        # community оставляем как ID, чтобы при создании поста можно было указать id группы
        read_only_fields = ['is_published']

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        # Проверяем, есть ли лайк от этого юзера на этом посте
        return Like.objects.filter(user=user, post=obj).exists()
