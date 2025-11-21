from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from .models import Profile, Community, Post, Subscription, Like, Topic
from .serializers import (
    ProfileSerializer, CommunitySerializer, PostSerializer, SubscriptionSerializer, TopicSerializer
)
from .permissions import IsAuthorOrReadOnly, IsProfileOwnerOrReadOnly



class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsProfileOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__username']


class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

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
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['author', 'community']
    search_fields = ['text', 'author__username']
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

    # ЭКШЕН ЛАЙКА
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like_obj, created = Like.objects.get_or_create(user=request.user, post=post)
        if created:
            return Response({'status': 'liked'})
        else:
            like_obj.delete()
            return Response({'status': 'unliked'})

    # УМНАЯ ЛЕНТА (Смешивание)
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def feed(self, request):
        user = request.user

        # 1. Подписки
        subscribed_posts = Post.objects.filter(
            Q(author__followers__subscriber=user) | Q(community__members=user),
            is_published=True
        ).order_by('-created_at').distinct()

        # 2. Рекомендации (по темам)
        user_topics = Community.objects.filter(members=user).values_list('topic', flat=True)
        recommended_posts = Post.objects.filter(
            community__topic__in=user_topics, is_published=True
        ).exclude(community__members=user).order_by('-created_at')

        # Смешиваем (упрощенно)
        # В реале тут нужна пагинация с миксером, но для MVP можно просто сложить
        # и взять срез (например, первые 20)
        mixed_feed = list(subscribed_posts[:10]) + list(recommended_posts[:3])
        mixed_feed.sort(key=lambda x: x.created_at, reverse=True)

        serializer = self.get_serializer(mixed_feed, many=True)
        return Response(serializer.data)


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
        serializer.save(subscriber=self.request.user)


class TopicViewSet(viewsets.ReadOnlyModelViewSet): # ReadOnly - темы менять нельзя через API
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [AllowAny]