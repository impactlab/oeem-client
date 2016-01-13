#!/bin/bash

source env.sh

if [ -z "$SETUP" ]; then
	echo "Skipping setup because SETUP is unset"
else
    echo $DATABASE_URL
	python manage.py migrate
	python manage.py collectstatic --noinput
fi

touch /srv/logs/gunicorn.log
touch /srv/logs/access.log
touch /srv/logs/django.log
tail -n 0 -f /srv/logs/*.log &

exec gunicorn oeem_client.wsgi \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 180 \
    --log-level=info \
    --log-file=/srv/logs/gunicorn.log \
    --access-logfile=/srv/logs/access.log \
    "$@"
