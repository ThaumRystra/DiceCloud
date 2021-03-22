FROM ubuntu:latest

RUN ln -sf /usr/share/zoneinfo/UTC /etc/localtime && echo UTC > /etc/timezone
RUN apt-get update && apt-get install -y curl tar git build-essential
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get -y install nodejs
RUN useradd --create-home --shell /bin/bash dicecloud

RUN mkdir -p /opt/dicecloud/src
COPY ./app/ /opt/dicecloud/src/
RUN chown -R dicecloud /opt/dicecloud
USER dicecloud
RUN curl https://install.meteor.com | sh
WORKDIR /opt/dicecloud/src
RUN meteor build --directory ../app --server-only
WORKDIR /opt/dicecloud/app/bundle/programs/server
RUN npm install
WORKDIR /opt/dicecloud/app/bundle

ENTRYPOINT node main.js
