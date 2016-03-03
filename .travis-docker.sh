#!/bin/sh -e

echo DJANGO_SETTINGS_MODULE="$DJANGO_SETTINGS_MODULE" > env.list
echo DJANGO_LOGFILE="$DJANGO_LOGFILE" >> env.list
echo DATABASE_URL="$DATABASE_URL" >> env.list
echo DATASTORE_URL="$DATASTORE_URL" >> env.list
echo DATASTORE_ACCESS_TOKEN="$DATASTORE_ACCESS_TOKEN" >> env.list
echo SECRET_KEY="$SECRET_KEY" >> env.list
echo SETUP="$SETUP" >> env.list
echo TEST="$TEST" >> env.list

docker build -t impactlab/oeem-client .
docker run --env-file=env.list impactlab/oeem-client
