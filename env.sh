#!/bin/bash

if [ -e '/etc/secret-volume' ]; then
    echo 'In kubernetes environment; using secrets'

    export DATABASE_URL=postgres://$(cat /etc/secret-volume/pg-user):$(cat /etc/secret-volume/pg-password)@$(cat /etc/secret-volume/pg-service-name).default.svc.cluster.local:5432/$(cat /etc/secret-volume/pg-user)
    export SECRET_KEY=$(cat /etc/secret-volume/secret-key)
    export DATASTORE_URL=$(cat /etc/secret-volume/datastore-url)
    export DATASTORE_ACCESS_TOKEN=$(cat /etc/secret-volume/datastore-access-token)
    export DJANGO_LOGFILE=/srv/logs/django.log

else

    echo 'Not in kubernetes environment; not using secrets'
    echo $DATABASE_URL
    echo $SECRET_KEY
    echo $DATASTORE_ACCESS_TOKEN
    echo $DATABASE_URL
    echo $DJANGO_LOGFILE

fi
