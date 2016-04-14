FROM continuumio/anaconda3

# python
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get install -y postgresql-client libpq-dev curl build-essential

# node and npm
RUN echo "deb http://ftp.us.debian.org/debian wheezy-backports main" >> /etc/apt/sources.list \
    && DEBIAN_FRONTEND=noninteractive apt-get -y update \
    && apt-get install -y nodejs-legacy \
    && mkdir -p /etc/pki/tls/certs \
    && cp /etc/ssl/certs/ca-certificates.crt /etc/pki/tls/certs/ca-bundle.crt \
    && curl -L --insecure -O https://www.npmjs.org/install.sh \
    && /bin/bash install.sh \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf install.sh \
    && npm install --global gulp-cli

EXPOSE 8000

ENV DJANGO_SETTINGS_MODULE oeem_client.settings
ENV STATIC_ROOT /srv/static

RUN mkdir /srv/static /srv/logs

VOLUME /srv/static

RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
COPY package.json /code/
RUN pip install -r requirements.txt && npm install
ADD . /code/

# build static assets
RUN gulp build:production

COPY ./docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
