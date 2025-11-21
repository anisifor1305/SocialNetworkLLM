from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Community, Post, Topic, Subscription, Profile, Like
from faker import Faker
import random


class Command(BaseCommand):
    help = 'Наполняет соцсеть живыми данными (Пользователи, Группы, Посты, Лайки)'

    def handle(self, *args, **kwargs):
        fake = Faker(['ru_RU'])  # Генерируем русские имена и тексты

        self.stdout.write('🧹 Очистка старых данных...')
        Like.objects.all().delete()
        Post.objects.all().delete()
        Subscription.objects.all().delete()
        Community.objects.all().delete()
        Topic.objects.all().delete()
        # Удаляем всех юзеров, кроме суперпользователей (админов)
        User.objects.filter(is_superuser=False).delete()

        # --- 1. ТЕМАТИКИ ---
        self.stdout.write('🏷️ Создаем тематики...')
        topics_names = ['IT и Разработка', 'Дизайн', 'Спорт', 'Музыка', 'Кино', 'Наука', 'Мемы', 'Путешествия']
        db_topics = []
        for name in topics_names:
            t = Topic.objects.create(name=name)
            db_topics.append(t)

        # --- 2. ПОЛЬЗОВАТЕЛИ ---
        self.stdout.write('bust_in_silhouette Создаем пользователей...')
        users = []
        for _ in range(15):  # Создаем 15 юзеров
            # Генерируем уникальный ник
            username = fake.unique.user_name()
            email = fake.email()

            user = User.objects.create_user(
                username=username,
                email=email,
                password='password123'  # Пароль для всех одинаковый
            )

            # Обновляем профиль (он создался автоматически через signal)
            user.profile.bio = fake.sentence(nb_words=10)
            user.profile.status = random.choice(['В сети', 'Кодит', 'Спит', 'На хакатоне', 'Отдыхает'])
            user.profile.save()

            users.append(user)

        # --- 3. СООБЩЕСТВА ---
        self.stdout.write('🏰 Создаем сообщества...')
        communities = []
        for _ in range(8):  # 8 групп
            c = Community.objects.create(
                title=fake.company(),  # Название компании как название группы
                description=fake.text(max_nb_chars=200),
                creator=random.choice(users),
                topic=random.choice(db_topics),
                needs_moderation=random.choice([True, False])
            )
            # Добавляем случайных участников (от 3 до 10 человек)
            members_count = random.randint(3, 10)
            random_members = random.sample(users, k=members_count)
            c.members.set(random_members)
            communities.append(c)

        # --- 4. ПОДПИСКИ (ДРУЖБА) ---
        self.stdout.write('🤝 Настраиваем подписки...')
        for u in users:
            # Каждый подписывается на 3-5 случайных людей
            targets = random.sample(users, k=random.randint(3, 5))
            for t in targets:
                if u != t:  # Не подписываться на себя
                    Subscription.objects.get_or_create(subscriber=u, target_user=t)

        # --- 5. ПОСТЫ ---
        self.stdout.write('📝 Пишем посты...')
        posts = []
        for _ in range(100):  # 100 постов
            author = random.choice(users)

            # Решаем, куда писать: в группу (60%) или к себе на стену (40%)
            community = None
            if random.random() > 0.4:
                # Выбираем случайную группу (даже если он там не состоит, для теста админки)
                # Но лучше выбирать ту, где состоит, чтобы логика была честной.
                # Для простоты берем любую.
                community = random.choice(communities)

            post = Post.objects.create(
                text=fake.text(max_nb_chars=300),
                author=author,
                community=community,
                is_published=True  # Сразу публикуем, чтобы было видно в ленте
            )
            posts.append(post)

        # --- 6. ЛАЙКИ ---
        self.stdout.write('❤️ Ставим лайки...')
        for _ in range(200):  # 200 лайков
            user = random.choice(users)
            post = random.choice(posts)
            # get_or_create, чтобы не упасть с ошибкой уникальности
            Like.objects.get_or_create(user=user, post=post)

        self.stdout.write(self.style.SUCCESS(
            f'✅ Готово! Создано: {len(users)} юзеров, {len(communities)} групп, {len(posts)} постов.'))