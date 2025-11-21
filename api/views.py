from django.db import models
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Profile, Community, Post, Subscription
from .serializers import (
    ProfileSerializer,
    CommunitySerializer,
    PostSerializer,
    SubscriptionSerializer
)
from .permissions import IsAuthorOrReadOnly, IsProfileOwnerOrReadOnly

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    # Просматривать могут все, менять - только авторизованные (в идеале добавить проверку, что это твой профиль)
    permission_classes = [IsProfileOwnerOrReadOnly]

    filter_backends = [filters.SearchFilter]
    search_fields = ['user__username']


class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']


    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    # Экшен: Вступить в группу
    # POST /api/communities/{id}/join/
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        group = self.get_object()
        if group.members.filter(id=request.user.id).exists():
            return Response({'detail': 'Вы уже участник'}, status=status.HTTP_400_BAD_REQUEST)

        group.members.add(request.user)
        return Response({'detail': 'Добро пожаловать в сообщество!'})

    # Экшен: Выйти из группы
    # POST /api/communities/{id}/leave/
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def leave(self, request, pk=None):
        group = self.get_object()
        if not group.members.filter(id=request.user.id).exists():
            return Response({'detail': 'Вы не состоите в этой группе'}, status=status.HTTP_400_BAD_REQUEST)

        group.members.remove(request.user)
        return Response({'detail': 'Вы покинули сообщество'})


# --- 3. ПОСТЫ (СТЕНА И ЛЕНТА) ---
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # Фильтры: можно получить посты конкретного юзера (?author=5) или группы (?community=1)
    filterset_fields = ['author', 'community']
    search_fields = ['text', 'author__username']
    ordering_fields = ['created_at']
    ordering = ['-created_at']  # По умолчанию сначала новые

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    # 🔥 ГЛАВНАЯ ФИЧА: Умная Лента Новостей
    # GET /api/posts/feed/
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def feed(self, request):
        user = request.user

        # 1. Находим всех, на кого подписан юзер (target_user из модели Subscription)
        following_users = Subscription.objects.filter(subscriber=user).values_list('target_user', flat=True)

        # 2. Находим все группы, где состоит юзер
        my_communities = user.communities.all()

        # 3. Делаем выборку постов:
        # (Автор подписки ИЛИ Группа участника)
        feed_posts = Post.objects.filter(
            Q(author__id__in=following_users) | Q(community__in=my_communities)
        ).order_by('-created_at')

        # 4. Пагинация (чтобы не грузить миллион постов)
        page = self.paginate_queryset(feed_posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(feed_posts, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        community_id = self.request.data.get('community')

        # ПО УМОЛЧАНИЮ: Пост скрыт (ждет модерации)
        is_published = False

        if community_id:
            try:
                community = Community.objects.get(id=community_id)

                # ЛОГИКА ПУБЛИКАЦИИ:
                # Если модерация ОТКЛЮЧЕНА (False) -> Публикуем сразу
                # ИЛИ Если автор поста - создатель группы -> Публикуем сразу
                if not community.needs_moderation or community.creator == self.request.user:
                    is_published = True

            except Community.DoesNotExist:
                # Если группы нет оставляем False или True по желанию
                pass
        else:
            # Если пост на личной стене (без группы) -> Публикуем сразу (своя стена)
            is_published = True

        serializer.save(author=self.request.user, is_published=is_published)

    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.all()

        # В ленте показываем только опубликованные посты
        # ИЛИ неопубликованные, но МОИ (чтобы я видел, что отправил в предложку)
        if self.action == 'list':
            return queryset.filter(models.Q(is_published=True) | models.Q(author=user))

        return queryset


# --- 4. ПОДПИСКИ ---
class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    # Можно посмотреть "Мои подписки" (?subscriber=me) или "Моих подписчиков"
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subscriber', 'target_user']

    def perform_create(self, serializer):
        # Запрещаем подписываться на самого себя
        target_id = self.request.data.get('target_user_id')  # Или target_user
        if target_id and int(target_id) == self.request.user.id:
            # (Тут можно кинуть ошибку ValidationError, но для хакатона можно пропустить)
            pass

        serializer.save(subscriber=self.request.user)