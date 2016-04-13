FROM continuumio/anaconda3

# python
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get install -y postgresql-client libpq-dev curl build-essential

RUN sh -c 'echo "deb http://ftp.debian.org/debian wheezy-backports main" > \
    /etc/apt/sources.list.d/wheezy-backports.list'
RUN curl --silent --location https://deb.nodesource.com/setup_0.12 | bash -
RUN apt-get update && apt-get install nodejs -y

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
