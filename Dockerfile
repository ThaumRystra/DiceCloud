FROM ubuntu:latest
RUN apt-get update --quiet \
    && apt-get install --quiet --yes \
    bsdtar \
    curl \
    git
RUN ln --symbolic --force $(which bsdtar) $(which tar)
RUN useradd --create-home --shell /bin/bash dicecloud
USER dicecloud
WORKDIR /home/dicecloud
RUN curl https://install.meteor.com/?release=1.8.0.2 | sh
ENV PATH="${PATH}:/home/dicecloud/.meteor"
COPY dev.sh ./dev.sh
ENTRYPOINT ./dev.sh