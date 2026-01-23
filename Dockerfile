FROM debian:bookworm

ARG NODE_VERSION=14.21.3
RUN test -n "$NODE_VERSION" || ( echo "NODE_VERSION build argument is not defined" >&2 && exit 1 )

RUN apt-get -y update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        xz-utils

ENV PATH="/usr/local/node/bin:/usr/local/node/sbin:${PATH}"

RUN arch="$( if [ "$(uname -m)" = "aarch64" ]; then echo "arm64"; else echo "x64"; fi )" && \
	mkdir /usr/local/node && cd /usr/local/node && \
    echo https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${arch}.tar.xz && \
	curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${arch}.tar.xz | tar -xJ --strip-components=1

RUN adduser --system --shell /bin/bash --home /home/mt/ mt
USER mt
WORKDIR /home/mt

RUN curl https://install.meteor.com/ | sh

WORKDIR /home/mt/dicecloud
COPY --chown=mt ./app ./app
WORKDIR /home/mt/dicecloud/app

RUN npm install --production
ENV PATH=${PATH}:/home/mt/.meteor
RUN meteor build --directory ~/dc/ --architecture os.linux.x86_64

WORKDIR /home/mt/dc/bundle/programs/server
RUN npm install

WORKDIR /home/mt/dc/bundle
RUN rm -r /home/mt/dicecloud

COPY ./README.md ./
COPY ./License.md ./

ENTRYPOINT ["node", "main.js"]
