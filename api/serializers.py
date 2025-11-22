from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import Profile, Community, Subscription, Post, Like, Topic, Comment, Notification, Message
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from datetime import datetime


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
    birth_date = serializers.CharField(required=True, write_only=True)

    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'username', 'password', 'nickname', 'birth_date')

    def validate(self, attrs):
        """
        FIX: Djoser пытается создать инстанс User(**attrs) для проверки пароля.
        Поля nickname и birth_date отсутствуют в модели User, что вызывает TypeError.
        Мы временно удаляем их перед валидацией родительского класса и возвращаем обратно после.
        """
        nickname = attrs.pop('nickname', None)
        birth_date = attrs.pop('birth_date', None)

        attrs = super().validate(attrs)

        if nickname:
            attrs['nickname'] = nickname
        if birth_date:
            attrs['birth_date'] = birth_date

        return attrs

    def validate_birth_date(self, value):
        """Валидация и конвертация даты из формата DD.MM.YYYY или YYYY-MM-DD"""
        date_formats = ['%d.%m.%Y', '%Y-%m-%d']

        for date_format in date_formats:
            try:
                return datetime.strptime(value, date_format).date()
            except ValueError:
                continue

        raise serializers.ValidationError(
            "Неверный формат даты. Используйте формат ДД.ММ.ГГГГ (13.05.2007) или ГГГГ-ММ-ДД (2007-05-13)"
        )

    def create(self, validated_data):
        nickname = validated_data.pop('nickname', '')
        birth_date = validated_data.pop('birth_date', None)

        with transaction.atomic():
            user = super().create(validated_data)
            profile, created = Profile.objects.get_or_create(user=user)
            profile.nickname = nickname
            profile.birth_date = birth_date
            profile.save()

        return user


class CurrentUserSerializer(serializers.ModelSerializer):
    # ===============================================================
    # 1. ПОЛЯ, КОТОРЫЕ МЫ МЕНЯЕМ (Profile)
    # ===============================================================
    # Убираем read_only, ставим required=False для PATCH-запросов

    nickname = serializers.CharField(source='profile.nickname', required=False)
    bio = serializers.CharField(source='profile.bio', required=False, allow_blank=True)
    status = serializers.CharField(source='profile.status', required=False, allow_blank=True)
    avatar = serializers.ImageField(source='profile.avatar', required=False, allow_null=True)

    # Дата рождения (с защитой от кривых форматов)
    birth_date = serializers.DateField(
        source='profile.birth_date',
        required=False,
        allow_null=True,
        format='%Y-%m-%d',  # Как отдаем (2005-05-20)
        input_formats=['%Y-%m-%d', '%d.%m.%Y', 'iso-8601']  # Как принимаем
    )

    # ===============================================================
    # 2. ПОЛЯ, КОТОРЫЕ МЫ НЕ ТРОГАЕМ (User) -> ВСЕ READ_ONLY
    # ===============================================================

    username = serializers.CharField(read_only=True)  # Handle
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    # Алиас для удобства фронта (handle = username)
    handle = serializers.CharField(source='username', read_only=True)

    # Ваши счетчики (Read only)
    posts_count = serializers.SerializerMethodField()
    friends_count = serializers.SerializerMethodField()
    friends = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'handle', 'email',
            'nickname', 'bio', 'avatar', 'status', 'birth_date',
            'posts_count', 'friends_count', 'friends',
            'first_name', 'last_name', 'date_joined', 'last_login',
            'is_active', 'is_staff', 'is_superuser'
        ]

    # ===============================================================
    # 3. ЛОГИКА ОБНОВЛЕНИЯ (Только профиль!)
    # ===============================================================
    def update(self, instance, validated_data):

        profile_data = validated_data.pop('profile', {})



        profile = instance.profile

        # Проходим по всем полям, которые прислал фронт (nickname, bio, etc.)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)

        # Сохраняем ТОЛЬКО профиль
        profile.save()

        return instance

    def get_posts_count(self, obj):
        return obj.posts.filter(is_published=True).count()

    def get_friends_count(self, obj):
        user_following = obj.following.values_list('target_user_id', flat=True)
        return Subscription.objects.filter(
            subscriber_id__in=user_following,
            target_user=obj
        ).count()

    def get_friends(self, obj):
        """Возвращает список объектов друзей"""
        user_following = obj.following.values_list('target_user_id', flat=True)
        friends_subscriptions = Subscription.objects.filter(
            subscriber_id__in=user_following,
            target_user=obj
        ).select_related('subscriber', 'subscriber__profile')

        friends = [sub.subscriber for sub in friends_subscriptions]
        return UserShortSerializer(friends, many=True, context=self.context).data


class ProfileSerializer(serializers.ModelSerializer):
    handle = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    posts_count = serializers.SerializerMethodField()
    friends_count = serializers.SerializerMethodField()
    friends = serializers.SerializerMethodField()

    birth_date = serializers.DateField(
        format='%d.%m.%Y',
        input_formats=['%d.%m.%Y', '%Y-%m-%d', 'iso-8601']
    )

    class Meta:
        model = Profile
        fields = ['id', 'handle', 'nickname', 'email', 'bio', 'avatar', 'status',
                  'birth_date',
                  'posts_count', 'friends_count', 'friends']

    def get_posts_count(self, obj):
        return obj.user.posts.filter(is_published=True).count()

    def get_friends_count(self, obj):
        user_following = obj.user.following.values_list('target_user_id', flat=True)
        return Subscription.objects.filter(
            subscriber_id__in=user_following,
            target_user=obj.user
        ).count()

    def get_friends(self, obj):
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
    is_member = serializers.SerializerMethodField()

    topic = serializers.StringRelatedField(read_only=True)
    topic_id = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(), source='topic', write_only=True
    )

    class Meta:
        model = Community
        fields = ['id', 'title', 'description', 'avatar', 'topic', 'topic_id', 'created_at', 'creator', 'members',
                  'members_count', 'is_member']

    def get_is_member(self, obj):
        """
        Проверяет, подписан ли текущий пользователь (из request) на это сообщество.
        """
        user = self.context.get('request').user
        if user and not user.is_anonymous:
            return obj.members.filter(id=user.id).exists()
        return False

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