FROM continuumio/anaconda3

ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y postgresql-client libpq-dev

RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
RUN pip install -r requirements.txt
ADD . /code/

ENV DJANGO_SETTINGS_MODULE oeem-client.settings
ENV STATIC_ROOT /srv/static

EXPOSE 8000

RUN mkdir /srv/static /srv/logs

VOLUME /srv/static

COPY ./docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
