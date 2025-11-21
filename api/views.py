from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from .models import Profile, Community, Post, Subscription, Like, Topic, Notification
from .serializers import (
    ProfileSerializer, CommunitySerializer, PostSerializer, SubscriptionSerializer, TopicSerializer,
    NotificationSerializer
)
from .permissions import IsAuthorOrReadOnly, IsProfileOwnerOrReadOnly, IsCommunityCreatorOrReadOnly



class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsProfileOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__username', 'nickname']


class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated, IsCommunityCreatorOrReadOnly]

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'description']

    filterset_fields = ['members']

    def perform_create(self, serializer):
        community = serializer.save(creator=self.request.user)
        community.members.add(self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        group = self.get_object()
        if group.members.filter(id=request.user.id).exists():
            return Response({'detail': 'Вы уже участник'}, status=status.HTTP_400_BAD_REQUEST)
        group.members.add(request.user)
        return Response({'detail': 'Добро пожаловать!'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def leave(self, request, pk=None):
        group = self.get_object()
        if not group.members.filter(id=request.user.id).exists():
            return Response({'detail': 'Не в группе'}, status=status.HTTP_400_BAD_REQUEST)
        group.members.remove(request.user)
        return Response({'detail': 'Вышли'})



class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['author', 'community']
    search_fields = ['text', 'author__username', 'author__profile__nickname']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        community_id = self.request.data.get('community')
        is_published = False

        if community_id:
            try:
                community = Community.objects.get(id=community_id)
                # Если модерация выключена ИЛИ автор - админ группы -> Публикуем
                if not community.needs_moderation or community.creator == self.request.user:
                    is_published = True
            except Community.DoesNotExist:
                pass
        else:
            is_published = True  # На личной стене сразу публикуем

        serializer.save(author=self.request.user, is_published=is_published)

    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.all()
        if self.action == 'list':
            # Показываем опубликованные ИЛИ мои (даже скрытые)
            if user.is_authenticated:
                return queryset.filter(Q(is_published=True) | Q(author=user))
            return queryset.filter(is_published=True)
        return queryset


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like_obj, created = Like.objects.get_or_create(user=request.user, post=post)
        if created:
            return Response({'status': 'liked',
                             'likes_count': post.likes.count(),
                             'is_liked': True})
        else:
            like_obj.delete()

            return Response({'status': 'unliked',
                             'likes_count': post.likes.count(),
                             'is_liked': False})

    # УМНАЯ ЛЕНТА (Смешивание)
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def feed(self, request):
        user = request.user

        # Настройки пагинации (сколько постов за раз грузить)
        page_size = 10

        # --- 1. ПОСТЫ ПОДПИСОК ---
        subscribed_posts = Post.objects.filter(
            Q(author__followers__subscriber=user) |
            Q(community__members=user),
            is_published=True
        ).distinct()

        # --- 2. ПОСТЫ РЕКОМЕНДАЦИЙ (по темам) ---
        user_topics = Community.objects.filter(members=user).values_list('topic', flat=True)
        recommended_posts = Post.objects.filter(
            community__topic__in=user_topics,
            is_published=True
        ).exclude(
            community__members=user
        ).exclude(
            id__in=subscribed_posts.values('id')  # Исключаем те, что уже попали в подписки
        )

        # --- СБОРКА И ПАГИНАЦИЯ ---
        # Берем, например, последние 50 постов от друзей и 20 рекомендаций
        # (С запасом, чтобы потом перемешать)
        pool_subs = list(subscribed_posts.order_by('-created_at')[:10])
        pool_recs = list(recommended_posts.order_by('-created_at')[:5])

        # Складываем
        mixed_feed = pool_subs + pool_recs

        # Сортируем по дате (свежие сверху)
        mixed_feed.sort(key=lambda x: x.created_at, reverse=True)

        # Обрезаем до размера страницы (например, берем топ-10)
        mixed_feed = mixed_feed[:page_size]

        # --- 3. ЗАПОЛНИТЕЛЬ (RANDOM) ---
        # Если набралось меньше 10 постов (например, юзер новый),
        # добиваем список рандомными постами.
        missing_count = page_size - len(mixed_feed)

        if missing_count > 0:
            # Собираем ID тех постов, которые мы УЖЕ нашли, чтобы не было дублей
            existing_ids = [p.id for p in mixed_feed]

            # Ищем любые опубликованные посты, кроме тех, что уже есть
            # order_by('?') - это сортировка в случайном порядке
            random_posts = Post.objects.filter(is_published=True) \
                .exclude(id__in=existing_ids) \
                .order_by('?')[:missing_count]

            # Добавляем их в конец ленты
            mixed_feed.extend(list(random_posts))

        # Сериализуем и отдаем
        serializer = self.get_serializer(mixed_feed, many=True)

        return Response({
            'count': len(mixed_feed),  # Сколько отдали сейчас
            'results': serializer.data
        })


# --- 4. ПОДПИСКИ ---
class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subscriber', 'target_user']

    def perform_create(self, serializer):
        target_id = self.request.data.get('target_user_id')
        if target_id and int(target_id) == self.request.user.id:
            raise PermissionDenied("Нельзя подписаться на себя")

        if target_id:
            already_subscribed = Subscription.objects.filter(
                subscriber=self.request.user,
                target_user_id=int(target_id)
            ).exists()

            if already_subscribed:
                raise PermissionDenied("Вы уже подписаны на этого пользователя")

        serializer.save(subscriber=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def unfollow(self, request):
        """Отписаться от пользователя по его ID"""
        target_user_id = request.data.get('target_user_id')

        if not target_user_id:
            return Response({'detail': 'Укажите target_user_id'},
                            status=status.HTTP_400_BAD_REQUEST)

        # ✅ ИСПРАВЛЕНИЕ: Преобразуем в int
        try:
            target_user_id = int(target_user_id)
        except (ValueError, TypeError):
            return Response({'detail': 'Неверный формат target_user_id'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            subscription = Subscription.objects.get(
                subscriber=request.user,
                target_user_id=target_user_id  # Теперь это точно число
            )
            subscription.delete()
            return Response({'detail': 'Вы отписались'},
                            status=status.HTTP_200_OK)  # Изменил на 200 вместо 204
        except Subscription.DoesNotExist:
            return Response({'detail': 'Вы не были подписаны на этого пользователя'},
                            status=status.HTTP_404_NOT_FOUND)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'All marked as read'})



class TopicViewSet(viewsets.ReadOnlyModelViewSet): # ReadOnly - темы менять нельзя через API
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [AllowAny]


from .models import Comment  # Импорт
from .serializers import CommentSerializer  # Импорт


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post', 'author']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    # Авто-авторство
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)