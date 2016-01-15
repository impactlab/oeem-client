import os
import dj_database_url

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = os.environ.get("SECRET_KEY")

DEBUG = os.environ.get("DEBUG", "false") == "true"

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = (
    'grappelli',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'sslserver',
    'dashboard',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)

ROOT_URLCONF = 'oeem_client.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
        ],
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

WSGI_APPLICATION = 'oeem_client.wsgi.application'

DATABASES = { 'default': dj_database_url.config() }

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.environ.get("STATIC_ROOT")

STATICFILES_DIRS = ( os.path.join(BASE_DIR,'staticfiles'),)

# OAUTH connection to datastore
DATASTORE_ACCESS_TOKEN = os.environ["DATASTORE_ACCESS_TOKEN"]

DATASTORE_URL = os.environ["DATASTORE_URL"]

GRAPPELLI_ADMIN_TITLE = "Open Energy Efficiency Meter"

# can be overridden in local_settings
CLIENT_SETTINGS = {
    'name': 'Demo',
    'slug': 'demo',
    'logo': 'logo.png',
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(asctime)s %(levelname)s [%(name)s:%(lineno)s] %(module)s %(process)d %(thread)d %(message)s'
        }
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'handlers': {
        'logfile': {
            'level': 'DEBUG',
            'filters': ['require_debug_false'],
            'class': 'logging.handlers.WatchedFileHandler',
            'formatter': 'verbose',
            'filename': os.environ.get("DJANGO_LOGFILE"),
        }
    },
    'loggers': {
        'django': {
            'handlers': ['logfile'],
            'level': 'DEBUG',
        },
        'customer_registry.views': {
            'handlers': ['logfile'],
            'level': 'DEBUG',
            'propagate': True,
        },
    }
}

try:
    from oeem_client.local_settings import *
except ImportError:
    pass
