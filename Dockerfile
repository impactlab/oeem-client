FROM continuumio/anaconda3

# python
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get install -y postgresql-client libpq-dev git-core curl \
                       build-essential openssl libssl-dev

RUN curl --silent --location https://deb.nodesource.com/setup_0.12 | bash -
RUN apt-get install --yes nodejs

    # git clone https://github.com/nodejs/node.git /tmp/node && \
    # cd /tmp/node && git checkout v5.10.1 && \
    # ./configure --openssl-libpath=/usr/lib/ssl && \
    # make && make test && sudo make install

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
