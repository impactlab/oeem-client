OEEM Client
===========

[![Build Status](https://travis-ci.org/impactlab/oeem-client.svg?branch=develop)](https://travis-ci.org/impactlab/oeem-client)


This client uses the Open EE Energy Datastore API to provide a front-end
dashboard experience.

Setup
-----

#### Make sure OS level dependencies are installed

- postgres

#### Clone the repo & change directories

    git clone git@github.com:impactlab/oeem-client.git
    cd oeem-client

#### Install required python packages

We recommend using virtualenv to manage python packages

    mkvirtualenv oeem-client
    pip install -r requirements.txt

#### Create the database (and optionally the eemeter weather cache database)

    createdb oeem_client

#### Define the following environment variables

    export DATABASE_URL=postgres://philngo:@0.0.0.0:5432/oeem_client
    export DEBUG=true
    export DJANGO_SETTINGS_MODULE=oeem_client.settings
    export SECRET_KEY=<django-secret-key>
    export DATASTORE_ACCESS_TOKEN=<my-access-token>
    export DATASTORE_URL=http://0.0.0.0:8000 #change to match URL of datastore
    export DJANGO_LOGFILE=django.log

You might consider adding these to your virtualenv postctivate script

    vim /path/to/virtualenvs/oeem-client/bin/postactivate
    workon oeem-client # reactivate environment

#### Run migrations

    python manage.py migrate

#### Create a superuser (for admin access)

    python manage.py createsuperuser

#### Start a server

    python manage.py runserver

### JSX offline transform (for React)

Install javascript deps (gulp):

    npm install

Run default gulp task, which watches the file dashboard/static/dashboard/js/src/main.jsx:

    gulp
