#!/bin/bash

export DATABASE_URL=postgres://$(cat /etc/secret-volume/pg-user):$(cat /etc/secret-volume/pg-password)@postgres:5432/$(cat /etc/secret-volume/pg-user)
export SECRET_KEY=$(cat /etc/secret-volume/secret-key)
export CLIENT_ID=$(cat /etc/secret-volume/client-id)
export DATASTORE_URL=$(cat /etc/secret-volume/datastore-url)
export DATASTORE_ACCESS_TOKEN=$(cat /etc/secret-volume/datastore-access-token)

if [ -z "$SETUP" ]; then
	echo "Skipping setup because SETUP is unset"
else
	python manage.py migrate
	python manage.py collectstatic --noinput
fi

touch /srv/logs/gunicorn.log
touch /srv/logs/access.log
tail -n 0 -f /srv/logs/*.log &

exec gunicorn oeem-client.wsgi \
    --bind 0.0.0.0:8000
