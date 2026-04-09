FROM ubuntu:noble

USER root
RUN adduser --system mt

RUN apt-get update
RUN apt-get install --quiet --yes curl ca-certificates gnupg
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get update
RUN apt-get install --quiet --yes nodejs git python3 build-essential

USER mt

RUN npx meteor

WORKDIR /home/mt
RUN git clone https://github.com/ThaumRystra/DiceCloud dicecloud
WORKDIR /home/mt/dicecloud/app
RUN npm install --production
ENV PATH=$PATH:/home/mt/.meteor
RUN meteor build --directory ~/dc/ --architecture os.linux.x86_64
WORKDIR /home/mt/dc/bundle/programs/server
RUN npm install
WORKDIR /home/mt/dc/bundle
RUN rm -r /home/mt/dicecloud

ENTRYPOINT ["node", "main.js"]
