from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Community, Subscription, Post, Like, Topic, Comment, Notification, Message
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer


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


    def validate(self, attrs):
        nickname = attrs.pop('nickname', None)

        attrs = super().validate(attrs)

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
    posts_count = serializers.SerializerMethodField()
    friends_count = serializers.SerializerMethodField()
    friends = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'handle', 'nickname', 'email', 'bio', 'avatar', 'status',
                  'posts_count', 'friends_count', 'friends']

    def get_posts_count(self, obj):
        return obj.user.posts.filter(is_published=True).count()

    def get_friends_count(self, obj):
        """Количество друзей (взаимные подписки)"""

        user_following = obj.user.following.values_list('target_user_id', flat=True)

        friends_count = Subscription.objects.filter(
            subscriber_id__in=user_following,
            target_user=obj.user
        ).count()

        return friends_count

    def get_friends(self, obj):  # ← Переименовал с get_friends_preview на get_friends
        """Превью друзей"""
        user_following = obj.user.following.values_list('target_user_id', flat=True)

        friends_subscriptions = Subscription.objects.filter(
            subscriber_id__in=user_following,
            target_user=obj.user
        ).select_related('subscriber', 'subscriber__profile')

        friends = [sub.subscriber for sub in friends_subscriptions]

        return UserShortSerializer(friends, many=True, context=self.context).data



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


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserShortSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'text', 'sender', 'is_read', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    community_title = serializers.ReadOnlyField(source='community.title')

    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'text', 'image', 'created_at',
                  'author', 'community', 'community_title',
                  'is_published', 'is_liked', 'likes_count', 'comments_count']
        read_only_fields = ['is_published']

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return Like.objects.filter(user=user, post=obj).exists()

class CommentSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'text', 'author', 'post', 'created_at']



class MessageSerializer(serializers.ModelSerializer):
    sender = UserShortSerializer(read_only=True)
    receiver = UserShortSerializer(read_only=True)

    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='receiver', write_only=True
    )

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'receiver_id', 'text', 'is_read', 'created_at']