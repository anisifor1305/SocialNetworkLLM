from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver



class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    bio = models.TextField(max_length=500, blank=True, verbose_name="О себе")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Аватарка")
    status = models.CharField(max_length=100, blank=True, default="В сети", verbose_name="Статус")

    def __str__(self):
        return f"Профиль {self.user.username}"

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

    # Настройка группы: Нужна ли премодерация?
    # Если False - посты появляются сразу (как в чате).
    # Если True - посты ждут одобрения.
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


class Post(models.Model):
    text = models.TextField(verbose_name="Текст поста")
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')

    # Если поле пустое (null) -> это пост на личной стене юзера
    # Если заполнено -> это пост в группе
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='posts', blank=True, null=True)

    # Статус поста.
    # True = Виден всем. False = Виден только автору и админам (ждет одобрения).
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return f"Post by {self.author.username}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Уникальность: Один юзер может лайкнуть один пост только 1 раз
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} liked {self.post.id}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()