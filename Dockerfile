FROM ubuntu:latest
#SET TZ TO YOUR LOCAL LINUX TIMEZONE!!!
ENV TZ=UTC
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime
RUN echo $TZ > /etc/timezone

RUN apt-get update && apt-get upgrade -y && apt-get install -y curl tar git build-essential
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get -y install nodejs
RUN curl https://install.meteor.com | sh
RUN useradd --create-home --shell /bin/bash dicecloud

RUN mkdir -p /opt/dicecloud/src
COPY ../app/ /opt/dicecloud/src/
RUN chown -R dicecloud /opt/dicecloud
USER dicecloud
WORKDIR /opt/dicecloud/src
RUN meteor npm install
RUN meteor build --directory ../app --server-only
WORKDIR /opt/dicecloud/app/bundle/programs/server
RUN npm install
WORKDIR /opt/dicecloud/app/bundle

EXPOSE 3003
EXPOSE 3000
ENTRYPOINT node main.js
