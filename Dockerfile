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
    && cd /code && npm install

EXPOSE 8000

ENV DJANGO_SETTINGS_MODULE oeem_client.settings
ENV STATIC_ROOT /srv/static

RUN mkdir /srv/static /srv/logs

VOLUME /srv/static

RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
ADD . /code/

COPY ./docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
