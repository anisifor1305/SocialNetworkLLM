from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import Profile, Community, Post, Subscription, Like, Topic, Notification, Message
from .serializers import (
    ProfileSerializer, CommunitySerializer, PostSerializer, SubscriptionSerializer, TopicSerializer,
    NotificationSerializer, MessageSerializer, UserShortSerializer
)
from .permissions import IsAuthorOrReadOnly, IsProfileOwnerOrReadOnly, IsCommunityCreatorOrReadOnly



class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsProfileOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__username', 'nickname']


class CommunityViewSet(viewsets.ModelViewSet):
    """
    ViewSet для работы с сообществами.
    """
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Для списка всех сообществ (вкладка "Сообщества") делаем рандомную сортировку.
        NOTE: order_by('?') тяжелая операция для БД, в реальном HighLoad
        используют отдельные алгоритмы рекомендаций, но для старта это ОК.
        """
        if self.action == 'list':
            return Community.objects.order_by('?')
        return Community.objects.all()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def randon_communities(self, request):
        user = request.user
        groups = Community.objects.all()
        serializer = self.get_serializer(groups, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='my')
    def my_communities(self, request):
        """
        Эндпоинт: /api/communities/my/
        Возвращает только те сообщества, на которые подписан текущий юзер.
        """
        user = request.user
        my_groups = Community.objects.filter(members=user)

        serializer = self.get_serializer(my_groups, many=True)
        return Response(serializer.data)

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

                if not community.needs_moderation or community.creator == self.request.user:
                    is_published = True
            except Community.DoesNotExist:
                pass
        else:
            is_published = True

        serializer.save(author=self.request.user, is_published=is_published)

    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.all()
        if self.action == 'list':

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

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def feed(self, request):
        user = request.user


        page_size = 10


        subscribed_posts = Post.objects.filter(
            Q(author__followers__subscriber=user) |
            Q(community__members=user),
            is_published=True
        ).distinct()


        user_topics = Community.objects.filter(members=user).values_list('topic', flat=True)
        recommended_posts = Post.objects.filter(
            community__topic__in=user_topics,
            is_published=True
        ).exclude(
            community__members=user
        ).exclude(
            id__in=subscribed_posts.values('id')
        )


        pool_subs = list(subscribed_posts.order_by('-created_at')[:10])
        pool_recs = list(recommended_posts.order_by('-created_at')[:5])

        # Складываем
        mixed_feed = pool_subs + pool_recs

        mixed_feed.sort(key=lambda x: x.created_at, reverse=True)


        mixed_feed = mixed_feed[:page_size]


        missing_count = page_size - len(mixed_feed)

        if missing_count > 0:

            existing_ids = [p.id for p in mixed_feed]


            random_posts = Post.objects.filter(is_published=True) \
                .exclude(id__in=existing_ids) \
                .order_by('?')[:missing_count]


            mixed_feed.extend(list(random_posts))


        serializer = self.get_serializer(mixed_feed, many=True)

        return Response({
            'count': len(mixed_feed),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def random(self, request):
        """
        Эндпоинт: /api/posts/random/
        Возвращает ОДИН случайный пост (объект, не список).
        """
        random_post = self.get_queryset().order_by('?').first()

        if not random_post:
            return Response(
                {"detail": "В базе пока нет постов 😔"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(random_post)
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subscriber', 'target_user']

    def perform_create(self, serializer):
        target_user = serializer.validated_data.get('target_user')

        if target_user == self.request.user:
            raise ValidationError({"detail": "Нельзя подписаться на самого себя"})

        if Subscription.objects.filter(subscriber=self.request.user, target_user=target_user).exists():
            raise ValidationError({"detail": "Вы уже подписаны на этого пользователя"})

        serializer.save(subscriber=self.request.user)

        # target_id = self.request.data.get('target_user_id')
        # if target_id and int(target_id) == self.request.user.id:
        #     raise PermissionDenied("Нельзя подписаться на себя")
        #
        # if target_id:
        #     already_subscribed = Subscription.objects.filter(
        #         subscriber=self.request.user,
        #         target_user_id=int(target_id)
        #     ).exists()
        #
        #     if already_subscribed:
        #         raise PermissionDenied("Вы уже подписаны на этого пользователя")
        #
        # serializer.save(subscriber=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def unfollow(self, request):
        """Отписаться от пользователя по его ID"""
        target_user_id = request.data.get('target_user_id')

        if not target_user_id:
            return Response({'detail': 'Укажите target_user_id'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user_id = int(target_user_id)
        except (ValueError, TypeError):
            return Response({'detail': 'Неверный формат target_user_id'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            subscription = Subscription.objects.get(
                subscriber=request.user,
                target_user_id=target_user_id
            )
            subscription.delete()
            return Response({'detail': 'Вы отписались'},
                            status=status.HTTP_200_OK)
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



class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [AllowAny]


from .models import Comment
from .serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post', 'author']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(receiver=user))

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def conversation(self, request):
        """
        Получить переписку с конкретным пользователем.
        Использование: /api/messages/conversation/?with=ID_SOBESEDNIKA
        """
        user = request.user
        partner_id = request.query_params.get('with')

        if not partner_id:
            return Response({'detail': 'Параметр "with" обязателен (ID собеседника).'},
                            status=status.HTTP_400_BAD_REQUEST)

        messages = Message.objects.filter(
            Q(sender=user, receiver_id=partner_id) |
            Q(sender_id=partner_id, receiver=user)
        ).order_by('created_at')

        unread_messages = messages.filter(receiver=user, is_read=False)
        unread_messages.update(is_read=True)

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def inbox(self, request):
        """
        Список диалогов (Inbox).
        Возвращает список пользователей, с которыми была переписка,
        плюс последнее сообщение от каждого.
        """
        user = request.user


        messages = Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-created_at')


        conversations = []
        processed_partners = set()

        for message in messages:

            if message.sender == user:
                partner = message.receiver
            else:
                partner = message.sender

            if partner.id not in processed_partners:

                conversations.append({
                    'partner': UserShortSerializer(partner).data,
                    'last_message': {
                        'text': message.text,
                        'is_read': message.is_read,
                        'created_at': message.created_at,
                        'am_i_sender': message.sender == user
                    }
                })
                processed_partners.add(partner.id)

        return Response(conversations)