from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Community, Post, Topic, Subscription, Profile, Like
from faker import Faker
import random


class Command(BaseCommand):
    help = 'Наполняет соцсеть живыми данными (Пользователи, Группы, Посты, Лайки)'

    def handle(self, *args, **kwargs):
        fake = Faker(['ru_RU'])

        self.stdout.write('🧹 Очистка старых данных...')
        Like.objects.all().delete()
        Post.objects.all().delete()
        Subscription.objects.all().delete()
        Community.objects.all().delete()
        Topic.objects.all().delete()

        User.objects.filter(is_superuser=False).delete()


        self.stdout.write('🏷️ Создаем тематики...')
        topics_names = ['IT и Разработка', 'Дизайн', 'Спорт', 'Музыка', 'Кино', 'Наука', 'Мемы', 'Путешествия']
        db_topics = []
        for name in topics_names:
            t = Topic.objects.create(name=name)
            db_topics.append(t)


        self.stdout.write('👤 Создаем пользователей...')
        users = []
        for _ in range(15):

            username = fake.unique.user_name()

            user = User.objects.create_user(
                username=username,
                email=fake.email(),
                password='password123'
            )

            user.profile.nickname = fake.name()
            user.profile.birth_date = fake.date_of_birth(minimum_age=18, maximum_age=55)  # 👈 Используем Faker
            user.profile.status = random.choice(['В сети', 'Кодит', 'Спит', 'На хакатоне', 'Отдыхает'])
            user.profile.save()
            users.append(user)


        self.stdout.write('🏰 Создаем сообщества...')
        communities = []
        for _ in range(8):
            c = Community.objects.create(
                title=fake.company(),
                description=fake.text(max_nb_chars=200),
                creator=random.choice(users),
                topic=random.choice(db_topics),
                needs_moderation=random.choice([True, False])
            )

            members_count = random.randint(3, 10)
            random_members = random.sample(users, k=members_count)
            c.members.set(random_members)
            communities.append(c)


        self.stdout.write('🤝 Настраиваем подписки...')
        for u in users:

            targets = random.sample(users, k=random.randint(3, 5))
            for t in targets:
                if u != t:
                    Subscription.objects.get_or_create(subscriber=u, target_user=t)


        self.stdout.write('📝 Пишем посты...')
        posts = []
        for _ in range(100):
            author = random.choice(users)

            community = None
            if random.random() > 0.4:
                community = random.choice(communities)

            post = Post.objects.create(
                text=fake.text(max_nb_chars=300),
                author=author,
                community=community,
                is_published=True
            )
            posts.append(post)


        self.stdout.write('❤️ Ставим лайки...')
        for _ in range(200):  # 200 лайков
            user = random.choice(users)
            post = random.choice(posts)
            Like.objects.get_or_create(user=user, post=post)

        self.stdout.write(self.style.SUCCESS(
            f'✅ Готово! Создано: {len(users)} юзеров, {len(communities)} групп, {len(posts)} постов.'))