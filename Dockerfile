# ===== STAGE 1: Meteor builder =====
FROM node:16-slim AS builder

# Builder variables set
ENV METEOR_ALLOW_SUPERUSER=true \
    METEOR_DISABLE_OPTIMISTIC_CACHING=true \
    METEOR_NO_RELEASE_CHECK=true \
    METEOR_DISABLE_OPLOG=false \
    METEOR_HOME=/base/.meteor

# Project initial setup
RUN adduser --system --group --home /base mt && chown -R mt:mt /base
WORKDIR /base
COPY --chown=mt:mt app /base/app

# Installing Meteor and project dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
    curl ca-certificates openssl git bsdtar g++ build-essential procps python3 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /base/dc/bundle/programs/server && chown -R mt:mt /base

USER mt
RUN curl -fsSL https://install.meteor.com/\?release\=2.16 -o /tmp/install-meteor.sh && \
    sed -i "s/tar -xzf.*/bsdtar -xf \"\$TARBALL_FILE\" -C \"\$INSTALL_TMPDIR\"/g" /tmp/install-meteor.sh && \
    sh /tmp/install-meteor.sh && rm /tmp/install-meteor.sh

# Building Meteor project
WORKDIR /base/app
RUN export PATH=$PATH:/base/.meteor && \
    meteor npm ci --omit=dev && \
    meteor build --directory /base/dc --architecture os.linux.x86_64 && \
    rm -rf /base/.meteor ~/.npm ~/.cache

# Optimizing the final bundle
WORKDIR /base/dc/bundle/programs/server
RUN npm install && npm ci --omit=dev && npm uninstall fibers && \
    rm -rf /base/app /base/dc/bundle/programs/server/dev_bundle /base/dc/bundle/programs/web.browser.legacy /base/dc/bundle/programs/web.cordova && \
    find . -type f \( -name "*.md" -o -name "*.ts" -o -name "*.log" -o -name "*.d.ts" \) -delete && \
    find . -type d -name "tests" -exec rm -rf {} + && npm cache clean --force
#    node /base/dc/programs/server/node_modules/fibers/build

# ===== STAGE 2: Runtime otimizado =====
FROM node:15-alpine AS runtime

# Non-root user and bundle setup
RUN apk add python3 make g++ git
RUN adduser -D -h /app -s /bin/sh -u 1001 mt
USER mt
COPY --from=builder --chown=mt:mt /base/dc/bundle /app

WORKDIR /app/programs/server/
RUN npm install fibers
USER root
RUN apk del python3 make g++

USER mt
WORKDIR /app
EXPOSE 3000

# Running the Dicecloud server
CMD ["node", "--trace-warnings", "main.js"]
