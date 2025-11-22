"""
Django settings for hackathon_project.
"""

from pathlib import Path
import os
from datetime import timedelta

# --- 1. БАЗОВЫЕ НАСТРОЙКИ ПУТЕЙ ---
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# --- 2. БЕЗОПАСНОСТЬ ---
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-change-me-at-hackathon-please'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Разрешаем всем стучаться (для хакатона и тестов с другом)
ALLOWED_HOSTS = ['*']


# --- 3. ПРИЛОЖЕНИЯ (APPS) ---
INSTALLED_APPS = [
    # Стандартные
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Сторонние библиотеки
    'rest_framework',
    'djoser',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',


    'api',
]


# --- 4. MIDDLEWARE (Охрана) ---
MIDDLEWARE = [
    # CORS должен быть первым!
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'socialNetworkLLM.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


WSGI_APPLICATION = 'socialNetworkLLM.wsgi.application'


# --- 5. БАЗА ДАННЫХ ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# --- 6. ВАЛИДАЦИЯ ПАРОЛЕЙ ---
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# --- 7. ИНТЕРНАЦИОНАЛИЗАЦИЯ ---
LANGUAGE_CODE = 'ru-ru'  # Можно поставить русский
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# --- 8. СТАТИКА (CSS, JS) ---
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') # Для collectstatic


# --- 9. МЕДИА (КАРТИНКИ) ---
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# --- 10. НАСТРОЙКИ ID ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==========================================
#      НАСТРОЙКИ БИБЛИОТЕК (DRF, JWT)
# ==========================================

# --- DRF ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 5,
}

DJOSER = {
    'SERIALIZERS': {
        'user_create': 'api.serializers.CustomUserCreateSerializer',
        'current_user': 'api.serializers.CurrentUserSerializer'
    },
}

# --- JWT ---
SIMPLE_JWT = {
   'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
   'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
   'AUTH_HEADER_TYPES': ('Bearer',),
}





# --- CORS ---
# Разрешаем всё на время хакатона
CORS_ALLOW_ALL_ORIGINS = True
# Если нужно будет закрыть, раскомментируй это и закомментируй строку выше:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]