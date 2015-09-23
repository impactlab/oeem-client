OEEM Client
===========

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
    createdb eemeter_weather_cache # optional

#### Define the following environment variables

    export DJANGO_SETTINGS_MODULE=oeem_client.settings
    export DATABASE_URL=postgres://:@localhost:5432/oeem_client
    export DEBUG=true
    export SECRET_KEY=############################
    export EEMETER_WEATHER_CACHE_DATABASE_URL=postgres://:@localhost:5432/eemeter_weather_cache
    export DATASTORE_ACCESS_TOKEN=#####################
    export DATASTORE_URL=https://############

You might consider adding these to your virtualenv activate script

    vim /path/to/virtualenvs/oeem-client/bin/activate
    workon oeem-client

#### Run migrations

    python manage.py migrate

#### Create a superuser (for admin access)

    python manage.py createsuperuser

#### Start a server

    python manage.py runserver
