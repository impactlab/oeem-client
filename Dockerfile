FROM continuumio/anaconda3

# python
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y postgresql-client libpq-dev curl build-essential && \
    curl -sL https://deb.nodesource.com/setup_5.x | bash - && \
    apt-get install -y nodejs

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
