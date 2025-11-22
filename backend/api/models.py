from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver



class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    nickname = models.CharField(max_length=100, verbose_name="Имя (Никнейм)")
    bio = models.TextField(max_length=500, blank=True, verbose_name="О себе")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Аватарка")
    status = models.CharField(max_length=100, blank=True, default="В сети", verbose_name="Статус")
    birth_date = models.DateField(blank=True, null=True, verbose_name="Дата рождения")

    def __str__(self):
        return f"Профиль: Имя:{self.nickname} Уникальный Хэндл{self.user.username}"

class Topic(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название тематики")


    def __str__(self):
        return self.name

class Community(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, related_name='communities',
                              verbose_name="Тематика")
    title = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(blank=True, verbose_name="Описание")
    avatar = models.ImageField(upload_to='community_avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_communities')

    members = models.ManyToManyField(User, related_name='communities', blank=True)

    needs_moderation = models.BooleanField(default=True, verbose_name="Предмодерация постов")
    def __str__(self):
        return self.title

class Subscription(models.Model):
    subscriber = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('subscriber', 'target_user')

    def __str__(self):
        return f"{self.subscriber.username} -> {self.target_user.username}"

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    text = models.CharField(max_length=150)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.recipient.username} -> {self.sender.username}"


@receiver(post_save, sender=Subscription)
def create_subscription_notification(sender, instance, created, **kwargs):
    if created:

        Notification.objects.create(
            recipient=instance.target_user,
            sender=instance.subscriber,
            text=f"Пользователь {instance.subscriber.username} подписался на вас!"
        )

        is_mutual = Subscription.objects.filter(
            subscriber=instance.target_user,
            target_user=instance.subscriber
        ).exists()

        if is_mutual:

            Notification.objects.create(
                recipient=instance.subscriber,
                sender=instance.target_user,
                text=f"Ура! Вы теперь друзья с {instance.target_user.username}!"
            )

            Notification.objects.create(
                recipient=instance.target_user,
                sender=instance.subscriber,
                text=f"Ура! Вы теперь друзья с {instance.subscriber.username}!"
            )

class Post(models.Model):
    text = models.TextField(verbose_name="Текст поста")
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='posts', blank=True, null=True)

    is_published = models.BooleanField(default=False)

    def __str__(self):
        return f"Post by {self.author.username}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} liked {self.post.id}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


def get_user_friends(user):

    user_following_ids = Subscription.objects.filter(
        subscriber=user
    ).values_list('target_user_id', flat=True)

    friends_ids = Subscription.objects.filter(
        subscriber_id__in=user_following_ids,
        target_user=user
    ).values_list('subscriber_id', flat=True)

    return User.objects.filter(id__in=friends_ids)

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField(verbose_name="Текст комментария")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    text = models.TextField(verbose_name="Текст сообщения")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver}"
