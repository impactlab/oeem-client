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
    export DJANGO_LOGFILE=django.log

    # For extra info on connecting the datastore, see below
    export DATASTORE_ACCESS_TOKEN=<my-access-token>
    export DATASTORE_URL=http://0.0.0.0:8000 #change to match URL of datastore

You might consider adding these to your virtualenv postctivate script

    vim /path/to/virtualenvs/oeem-client/bin/postactivate
    workon oeem-client # reactivate environment

#### Run migrations

    python manage.py migrate

#### Create a superuser (for admin access)

    python manage.py createsuperuser

#### Start a server

    python manage.py runserver

#### Connecting the datastore and the client.

Once a superuser has been created for the client and the datastore, log in
to the datastore and manually create the access token defined in the ini file.

In the admin, create a Django OAuth Toolkit application with the following
attributes:

    Client id: Use default
    User: <pick a user or create a new one>
    Redirect URI: https://example-client.openeemeter.org (this can actually be any url - we don't use it when creating an application manually)
    Client type: Confidential
    Authorization grant type: Authorization code
    Client secret: Use default
    Name: OEEM Client (can be anything that helps you remember)


Then go over and manually create a Django OAuth Toolkit access token with
the following attributes.

    User: <same user as for the application>
    Token: <any string of characters - preferably at least 30 chars long and random>
    Application: <the application you just created>
    Expires: <some future date>
    Scope: "read write" (no quotes)

The environment variable `DATASTORE_ACCESS_TOKEN` should be set to the value
of this access token in the _client_'s deployment environment. E.g.

    export DATASTORE_ACCESS_TOKEN=YOUR_TOKEN_GOES_HERE

#### Adding data

You will upload data to the datastore and view it in the client.

See the API at this datastore URL: [http://0.0.0.0:8000/docs/](http://0.0.0.0:8000/docs/)

### JSX offline transform (for React)

Install javascript deps (gulp):

    npm install

Note: if this doesn't work, you may need to [install gulp globally](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) (`npm install --global gulp-cli`)

Run default gulp task, which watches the file dashboard/static/dashboard/js/src/main.jsx:

    gulp
