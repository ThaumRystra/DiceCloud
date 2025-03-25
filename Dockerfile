# Global variables set
ARG NODE_VERSION=14 \
    METEOR_VERSION=2.16 \
    HOME=/base \
    DC_HOME=/app \
    DC_BUILD=${HOME}/dc \
    DC_SRC=${HOME}${DC_HOME} 

# ===== STAGE 1: Meteor builder =====
FROM node:${NODE_VERSION}-slim AS builder

# Builder variables set
ARG HOME METEOR_VERSION DC_HOME DC_BUILD DC_SRC
ENV METEOR_ALLOW_SUPERUSER=true \
    METEOR_DISABLE_OPTIMISTIC_CACHING=true \
    METEOR_NO_RELEASE_CHECK=true \
    METEOR_DISABLE_OPLOG=false \
    METEOR_HOME=${HOME}/.meteor

# Project initial setup
RUN adduser --system --group --home ${HOME} mt && \
    chown -R mt:mt ${HOME}
WORKDIR ${HOME}
COPY --chown=mt:mt app ${DC_SRC}

# Installing Meteor and project dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
    curl ca-certificates openssl git bsdtar g++ build-essential procps && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
USER mt
RUN curl -fsSL https://install.meteor.com/\?release\=${METEOR_VERSION} -o /tmp/install-meteor.sh && \
    sed -i "s/tar -xzf.*/bsdtar -xf \"\$TARBALL_FILE\" -C \"\$INSTALL_TMPDIR\"/g" /tmp/install-meteor.sh && \
    sh /tmp/install-meteor.sh && \
    rm /tmp/install-meteor.sh

# Building Meteor project
WORKDIR ${DC_SRC}
RUN export PATH=$PATH:${METEOR_HOME} && \
    meteor npm ci --omit=dev && \
    meteor build --directory ${DC_BUILD} --architecture os.linux.x86_64 --release=${METEOR_VERSION} && \
    rm -rf ${METEOR_HOME} ~/.npm ~/.cache

# Optimizing the final bundle
WORKDIR ${DC_BUILD}/bundle/programs/server
RUN npm install && npm ci --omit=dev && \
    rm -rf ${DC_SRC} ${DC_BUILD}/bundle/programs/server/dev_bundle \
    ${DC_BUILD}/bundle/programs/web.browser.legacy \
    ${DC_BUILD}/bundle/programs/web.cordova && \
    find . -type f \( -name "*.md" -o -name "*.ts" -o -name "*.log" -o -name "*.d.ts" \) -delete && \
    find . -type d -name "tests" -exec rm -rf {} + && \
    npm cache clean --force

# ===== STAGE 2: Optimized Runtime =====
FROM node:${NODE_VERSION}-alpine AS runtime

# Non-root user and bundle setup
ARG DC_HOME DC_BUILD
RUN adduser -D -H -s /bin/sh -u 1001 mt
USER mt
COPY --from=builder --chown=mt:mt ${DC_BUILD}/bundle ${DC_HOME}
WORKDIR ${DC_HOME}
EXPOSE 3000

# Running the Dicecloud server
CMD ["node", "--trace-warnings", "main.js"]
