# Survey of DiceCloud forks and self-hosted derivatives (as of 2026-10-20)

Method: GitHub REST API, unauthenticated and read-only. `GET /repos/ThaumRystra/DiceCloud/forks?sort=stargazers&per_page=100` (pages 1 and 2, 135 forks in all), then `GET /repos/ThaumRystra/DiceCloud/compare/{branch}...{owner}:{branch}` for about 32 candidate forks: those pushed after they were created, or with a non-default name. The unauthenticated rate limit (60 per hour) ran out after that. The candidates' file contents were then read from raw.githubusercontent.com. Upstream at query time: 512 stars, 135 forks, default branch `develop`, last push 2026-05-10, `app/.meteor/release` = `METEOR@2.16` ([API](https://api.github.com/repos/ThaumRystra/DiceCloud); local checkout `app/.meteor/release`).

## Which forks are active or ahead of upstream, and what do their commits change?

### Takeaway
No fork has real community uptake. Every fork has 0 or 1 stars and no fork has forks of its own, so "notable" has to mean "has commits ahead". Of 135 forks, about 13 are ahead of upstream. Only one is a large, maintained derivative: **JPugetGil/DiceCloud**, 87 commits ahead, rewritten to Meteor 3.5.2, Vue 3 and Node 24, and active up to 2026-10-19. The others are small and single-purpose: Dockerfile fixes, a library importer, a dart-sass fix for Apple Silicon, a CI bundle build, auto-archiving, and one LARP-specific rebrand. Most of them are worth cherry-picking. The 60+ pre-2024 forks are stale.

### Cited Findings

**Fork landscape**
- Every fork in the list has at most 1 star, and all show `forks_count` 0. The 1-star forks are burnsixsixsix/DiceCloud1 (2017), Scary-Laura/DiceCloud1 (2018), NappingPiglet/DiceCloud (2021) and pietrantonio91/DiceCloud (2026, but 0 ahead and 0 behind, so an unchanged mirror). — [GitHub forks API](https://api.github.com/repos/ThaumRystra/DiceCloud/forks?sort=stargazers&per_page=100)
- About 60 forks were last pushed before Oct 2024 and are STALE (2+ years without activity). They are on the old `master` or `version-2` branches: the 2017–2019 `DiceCloud1` forks, zhudotexe (2022, 1598 commits behind), Newtim/DiceCloudRifts (2019), WeslleyNasRocha (2024-02), and others. — [forks API](https://api.github.com/repos/ThaumRystra/DiceCloud/forks?sort=stargazers&per_page=100&page=2); [compare zhudotexe](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/master...zhudotexe:master)
- Forks with zero commits ahead (unchanged mirrors) include galbotorix, danfmsouza, PutmanAugustine, Dreathwings/DnD, neuroradiology, StormDragon894, maarcotulio, willflet, Jarli01, Wekkser, Lithial, midnya, krukkeniels, and fefu-marquez/DiceCloudButBeyond. Their names promise more than the forks contain. — compare API, e.g. [Dreathwings](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...Dreathwings:develop)

**Forks ahead of upstream (compare API results)**

| Fork | Ahead / behind | Last commit | What it changes | Files touched | Portability to another fork |
|---|---|---|---|---|---|
| [JPugetGil/DiceCloud](https://github.com/JPugetGil/DiceCloud) | 87 / 0 | 2026-10-19 | Meteor 2.16 to **3.5.2**, Vue 2 to **3**, Vuetify 4, Rspack bundler, Node 24. French and English i18n. Player, active-player and admin roles with quotas. S3 improvements. **Library export/import**. SRD 5.1 bestiary. Party board, initiative and effect durations, targeting. Discord bot. Security fixes: action results computed server-side, data leak fixed, dice seed hidden from client. Production deploy kit (Mongo 7 replica set, Cloudflare tunnel, backups). CI with lint, tests and typecheck. | 300+ (the API caps the list at 300). Top areas: `api/creature` (128), `api/engine` (101), `api/discord` (31). The whole tree is reorganised (`imports/ui/`, `imports/startup/`). | **Low** as a merge. It diverges heavily from upstream's structure (Meteor 3 async APIs, a new folder layout, a new UI framework). Individual ideas, such as the deploy kit, library file format, Dockerfile and security fixes, have to be re-implemented, not cherry-picked. |
| [ardunaline/DiceCloud](https://github.com/ardunaline/DiceCloud) | 17 / 0 | 2026-05-05 | Multi-stage Dockerfile on `node:14-buster` with Buster repos pointed at archive.debian.org, Meteor pinned to 2.16, `METEOR_ALLOW_SUPERUSER`, dumb-init. Discord OAuth login, as local packages. Fixed Discord webhook. **DDP-based importer that pulls public libraries from dicecloud.com**. | 17 files. The importer is one new file, `app/imports/server/importLibraries.js` (+149), plus an import in `server/main.js`. Browser-side scripts live in `scripts/`, which is gitignored and not published. | **High** for the Dockerfile and the server method (new files only). Discord OAuth adds `app/packages/*` plus Register/SignIn edits (medium). |
| [larphq/dicecloud](https://github.com/larphq/dicecloud) | 8 / 0 | 2026-03-20 | LARP-specific: Discord-only OAuth plus a whitelist and a hardcoded root admin. One character per user, deletion locks, point-engine (`computePointBuy`) change. "Dark medieval" theme with DiceCloud branding and the About/Feedback pages removed. **All file uploads disabled**. Dungeon Scrawl map renderer. 3D dice (BabylonJS dice-box). "View-As" admin role testing. | 60+ files, with large deletions in `Home.vue`, `SignIn.vue`, `Register.vue`, `Account.vue` and `ResetPassword.vue`. | **Low–medium**. Heavy edits to upstream pages. The 3D dice overlay (`DiceTrayOverlay.vue`, +154) and the whitelist (new files) are the separable parts. |
| [LinuxUser393/DiceCloud](https://github.com/LinuxUser393/DiceCloud) | 15 / 10 | 2025-04-28 | Cron job that auto-archives creatures not computed in N days (configurable `archiveAfterDays`, default changed to 100). Soft-archive flag `meta.archive`. Archived creatures restored automatically when the `singleCharacter` publication subscribes. Adds a redis-oplog submodule. | 17 files (`api/creature/archive/*`, `server/cron/archiveOldCreatures.js`, publications, list UIs) | **Medium**. Touches upstream archive methods and publications. Useful for small instances to cut the size of the Mongo working set. 10 commits behind upstream. |
| [Arbel-arad/DiceCloud](https://github.com/Arbel-arad/DiceCloud) | 12 / 10 | 2025-03-25 | Multi-stage Dockerfile built from local `app/` (merged from danfmsouza's `docker-build` PR). Meteor 2.16 installed via a bsdtar-patched installer, `npm ci --omit=dev`, bundle pruned (removes web.browser.legacy and cordova). Runtime on `node:15-alpine` with fibers rebuilt. Also `.env`, a reworked docker-compose, `Dockerfile_old-schema`, a Nix flake and a justfile. | 12 files, all infra plus `package.json`/lockfile | **Medium**. Infra only, but the runtime Node is **15** while Meteor 2.16 bundles Node 14. That is a version mismatch, and the lockfile was rewritten (+1593/−1614). |
| [faultoverload/DiceCloud](https://github.com/faultoverload/DiceCloud) | 4 / 0 | 2026-04-25 | New `Dockerfile.production`: Ubuntu 22.04 builder with `libarchive-tools` (bsdtar), non-root user, Meteor installed by `?release=` pin, `--server-only` build, tarball found by glob. Runtime on `node:14-bullseye-slim` (it notes Buster EOL failures with `node:14-slim`). Plus `.dockerignore`. | 2 new files | **Very high**: drop-in. Caveat: it pins Meteor **2.12**, but upstream's `.meteor/release` is 2.16. Bump the pin. |
| [elsgcreate/DiceCloud](https://github.com/elsgcreate/DiceCloud) | 15 / 0 | 2026-06-11 | 15 iterations on the Dockerfile: Ubuntu base, `ARG NODE_MAJOR`, build-essential. Adds `app/Dockerfile`. | 2 files | High (infra only), but trial-and-error commits. Read the final file, not the history. |
| [hafadei/DiceCloud](https://github.com/hafadei/DiceCloud) | 4 / 0 | 2026-06-29 | GitHub Actions workflow `build-dicecloud.yml`, described as an "x86_64 build workflow for cross-arch ARM deployment". It installs Meteor, runs `meteor npm install` and `meteor build --architecture os.linux.x86_64` (with `--server-only` removed so the full npm tree is included), uploads the tarball as an artifact, and needs a 45-minute timeout. | 1 new file | **Very high**: one new file. |
| [faerysteel/DiceCloud](https://github.com/faerysteel/DiceCloud) | 1 / 0 | 2026-08-26 | "Fix Apple Silicon build by replacing node-sass with dart-sass". Vendors `zer0th:meteor-vuetify-loader` 0.1.41 as a local package (overriding Atmosphere) and swaps node-sass 4.14.1 for `sass` 1.27.0. Upstream's loader depends on node-sass, which has no darwin-arm64 binary for Node 14 and falls back to node-gyp 3.8.0, which needs Python 2. | 21 new files under `app/packages/meteor-vuetify-loader/` | **Very high**: additive local package, and upstream files are untouched. Probably also relevant to linux-arm64 builds (see the inference below). |
| [petroczizoltan/DiceCloud](https://github.com/petroczizoltan/DiceCloud) | 2 / 0 on `master` | 2026-09-19 | Dev-mode Docker on `meteor/meteor-base`, Meteor 2.12. Compose with `platform: linux/amd64`, `mongodb/mongodb-atlas-local`, mongo-express, and an internal network. | 5 files | Medium. Dev-only, on the old `master` branch. |
| [JonathanStranger/DiceCloudUnchained](https://github.com/JonathanStranger/DiceCloudUnchained) | 4 / 10 | 2025-04-18 | Vercel hosting skeleton (`vercel.json`, `.vercel/build.sh`). | 2 files | Low value. Vercel does not suit a long-lived Meteor/DDP server. |
| [Newtim/DiceCloudRifts](https://github.com/Newtim/DiceCloudRifts) | 1 / 1575 | 2019-10-23 | Only adds a CNAME. The name suggests Rifts (Palladium), but no system changes were committed. STALE. | 1 | none |

- Source of every row: the compare API, e.g. [ardunaline](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...ardunaline:develop), [JPugetGil](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...JPugetGil:develop), [faerysteel](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...faerysteel:develop), [faultoverload](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...faultoverload:develop), [hafadei](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...hafadei:develop), [larphq](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...larphq:develop), [LinuxUser393](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...LinuxUser393:develop), [Arbel-arad](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...Arbel-arad:develop), [elsgcreate](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...elsgcreate:develop), [petroczizoltan](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/master...petroczizoltan:master), [JonathanStranger](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...JonathanStranger:develop)
- JPugetGil's README says the fork runs the instance at dd-dc.hemoreg.me and has "moved to Meteor 3 and Vue 3, with an English and a French interface". Commit messages after 2026-10-01 are mostly in French. — [JPugetGil README](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/README.md)
- JPugetGil security commits include "Fix(security): les résultats d'une action ne viennent jamais du client" (action results never come from the client, 2026-10-12). It also has "Fix(security): bibliothèques privées, abonnés, cibles, groupes…" (private libraries, subscribers, targets, groups, 2026-10-13) and "Fix: fuite de données (envoi massif de données du serveur au client)" (data leak: mass data sent from server to client, 2026-10-08). Another fix covers "résistances, immunités et vulnérabilités jamais appliquées + graine des dés connue du client avant le jet": resistances, immunities and vulnerabilities were never applied, and the client knew the dice seed before the roll (2026-10-06). — [compare JPugetGil](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...JPugetGil:develop)

### Inferences
- The JPugetGil security fixes may describe bugs that also exist in upstream 2.16, such as the dice seed reaching the client and action results being trusted from the client. They are worth checking against the Reverent Abyss engine changes (`rollCoreDice` and friends), because the RA fork rewrites exactly the roll path. This is unverified: I read the commit titles only, not the diffs.
- For the user's fork, the cheapest wins are the purely additive ones: faultoverload's `Dockerfile.production` (bump the pin to 2.16), faerysteel's vendored dart-sass loader, hafadei's CI workflow, and ardunaline's `importLibraries.js`. None of them touches the engine files that RA modifies.

### Gaps
- piepie62, WeslleyNasRocha, Jonpot and kgscialdone could not be compared. The last three returned "Not Found" on the `version-2` branch comparison, and piepie62 hit the rate limit. All were last pushed before Nov 2024, so they are probably stale anyway.
- The compare API caps the file list at 300, so JPugetGil's full file list was not seen.
- GitHub's network graph and the "ahead" counts of forks on non-default branches were not checked.

## Has any fork solved self-hosting pain points (local-source builds, ARM64, Mongo pinning, dicecloud.com hardcoding, S3, SSL/reverse proxy)?

### Takeaway
Several forks fixed the upstream Dockerfile's main flaw, which is that it `git clone`s upstream instead of building local source: ardunaline, faultoverload, Arbel-arad, elsgcreate and JPugetGil all `COPY app/`. They also replace EOL bases (Buster repos, nodesource setup_14). JPugetGil is the only fork with a complete production story: Mongo 7.0 pinned as a replica set, Cloudflare tunnel for TLS, S3, `MAIL_FROM` defaulting to the ROOT_URL host, and backups. ARM64 is only partly addressed. faerysteel removed the node-sass blocker on Apple Silicon. hafadei and petroczizoltan sidestep ARM by building or running amd64 (CI artifact or `platform: linux/amd64`). No fork was found producing a native aarch64 server image. No fork was found to fix the hardcoded `https://dicecloud.com/invite/` link.

### Cited Findings
- The local fork's Dockerfile does `git clone https://github.com/ThaumRystra/DiceCloud`, builds with `--architecture os.linux.x86_64`, and uses nodesource `setup_14.x` on `ubuntu:jammy`. docker-compose uses `mongo:latest`. So local source changes such as the RA code are **not** in the image, and the Mongo version floats. — local `Dockerfile`, `docker-compose.yml`
- Local-source builds:
  - ardunaline: `COPY app/.meteor`, then `COPY app/ .`, then `meteor build --directory /bundle --server-only`.
  - faultoverload: `COPY --chown=dicecloud:dicecloud app/ ./app/`.
  - Arbel-arad: `COPY --chown=mt:mt app /base/app`.
  - JPugetGil: "builds the app in this repository".
  — [ardunaline compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...ardunaline:develop); [faultoverload compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...faultoverload:develop); [Arbel-arad Dockerfile](https://raw.githubusercontent.com/Arbel-arad/DiceCloud/develop/Dockerfile); [JPugetGil README](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/README.md)
- EOL base fixes:
  - ardunaline rewrites Buster apt sources to `archive.debian.org`.
  - faultoverload switched its runtime to `node:14-bullseye-slim` to avoid "the EOL Buster repo failures from node:14-slim".
  - ardunaline sets `METEOR_ALLOW_SUPERUSER=true` instead, while faultoverload creates a non-root user because "Meteor refuses to install as root".
  — same compare links as above
- Meteor version pinning:
  - ardunaline pipes the installer through `sed 's/^RELEASE=.*/RELEASE="2.16"/'`.
  - faultoverload and petroczizoltan use `install.meteor.com/?release=2.12`, which does not match upstream's 2.16.
  - Arbel-arad uses `?release=2.16`.
  - JPugetGil uses `ARG METEOR_RELEASE=3.5.2` with a matching `node:24.15.0-bookworm-slim` runtime, and notes that native modules such as bcrypt must match the Node version.
  — compare links; [JPugetGil compare (Dockerfile patch)](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...JPugetGil:develop)
- Mongo pinning: JPugetGil's `deploy/compose.yml` pins `mongo:7.0` as a single-member replica set (`--replSet rs0`, keyFile) so Meteor can use change streams. Its comment reads "Not 8.x: MongoDB 8 refuses to start on Linux kernels 6.19 to 7.0.13 (SERVER-121912)". — [JPugetGil deploy/compose.yml](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/deploy/compose.yml)
- The JPugetGil README says a standalone MongoDB makes Meteor 3.5 "poll the database instead, without a warning", so a replica set (one member is enough) is recommended. — [JPugetGil README](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/README.md)
- SSL / reverse proxy: JPugetGil uses a Cloudflare tunnel with service URL `http://dicecloud:3000`, no open router ports, and `HTTP_FORWARDED_COUNT=1` so rate limits see the real client IP. — [JPugetGil deploy/README.md](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/deploy/README.md)
- S3 in JPugetGil:
  - Settings take `s3.{key,secret,bucket,region,endpoint}`, or an `S3` env var. `endpoint` is for S3-compatible services.
  - Minimum IAM is `s3:PutObject`, `GetObject` and `DeleteObject` on `files/*`, plus optional `ListBucket`. The bucket stays private and the app serves files itself.
  - Without S3, uploads stay inside the container and "are lost" when it is recreated.
  — [JPugetGil README](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/README.md)
- larphq took the opposite route: "disabled all file uploads to conserve server space". — [larphq compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...larphq:develop)
- Email: JPugetGil adds `MAIL_FROM`, with the default `no-reply@<the ROOT_URL host>`. Upstream hardcodes `Accounts.emailTemplates.from = 'no-reply@dicecloud.com'` in `app/imports/server/config/accountsEmailConfig.js`. — [JPugetGil README](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/README.md); local `app/imports/server/config/accountsEmailConfig.js:3`
- Invite links: upstream `app/imports/client/ui/user/InviteDialog.vue:79` returns `` `https://dicecloud.com/invite/${token}` ``. `emailTemplate.js:51` loads the favicon from dicecloud.com, and `CharacterSheetPrinted.vue:112` uses `https://dicecloud.com` as the URL base. No fork in the compare results visibly changes InviteDialog. JPugetGil's reorganised tree was not fully visible. — local grep of `app/imports`
- ARM / Apple Silicon:
  - faerysteel says upstream's node-sass 4.14.1 "publishes no darwin-arm64 binary for Node 14 … requires Python 2. That makes the app unbuildable on Apple Silicon". It swaps in dart-sass.
  - hafadei's workflow is titled "add x86_64 build workflow for cross-arch ARM deployment".
  - petroczizoltan forces `platform: linux/amd64`.
  — [faerysteel compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...faerysteel:develop); [hafadei compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...hafadei:develop); [petroczizoltan compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/master...petroczizoltan:master)
- Upstream issue #311 (Feb 2023): self-hosted on a LAN, the app loaded from other devices but "nothing functioned". The fix was setting `ROOT_URL` before running meteor. — [Issue #311](https://github.com/ThaumRystra/DiceCloud/issues/311)

### Inferences
- node-sass is likely to block linux/aarch64 builds as well as darwin-arm64, because node-sass 4.14 had no linux-arm64 prebuilt binaries for Node 14. faerysteel's fix is the most likely prerequisite for any native ARM image. Building on ARM was not tested by any fork I found.
- In hafadei's approach, an x86_64 bundle built in CI is then deployed to ARM. That only works if the bundle's native modules (bcrypt, fibers) are rebuilt on the target (`npm install` in `programs/server`). The workflow does not show that step.
- The Mongo 8 kernel incompatibility (SERVER-121912) cited by JPugetGil is a reason to replace `mongo:latest` in the local compose. I took it from that repo's comment and did not verify it against MongoDB's tracker.

### Gaps
- I found no fork that publishes a multi-arch (amd64+arm64) Docker image. Docker Hub searches returned nothing DiceCloud-related, so whether a public DiceCloud image exists is unconfirmed. — [search](https://hub.docker.com/)
- I could not confirm whether JPugetGil fixed the invite-link URL: file paths changed in its reorganisation and the compare list was truncated.

## Has any fork implemented library export/import (JSON), or a way to copy official SRD libraries into a self-hosted instance?

### Takeaway
Yes, two of them. **ardunaline** added a DDP-based importer that pulls public libraries from dicecloud.com and saves them locally with ID remapping. It is small and additive. **JPugetGil** has a full in-app library and collection export to file, plus admin import, plus CLI scripts (`tools/libraryImport`). Its deploy script bulk-imports gzipped library snapshots, but those tools are deliberately kept out of git. Upstream itself only closed the character-level export request, via v2 character archives.

### Cited Findings
- ardunaline commits, in order:
  1. "Add DDP-based importer to pull public libraries from dicecloud.com"
  2. "Rewrite library importer: move DDP to browser, keep data saving on server"
  3. "Rewrite ID remapping: pre-generate IDs, handle parent/parentId/ancestors/refs"
  4. "Call rebuildNestedSets after import to fix left/right tree structure"
  — [ardunaline compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...ardunaline:develop)
- ardunaline's `saveImportedLibrary({library, nodes, ownerId})` Meteor method:
  - Skips a library if one with the same name and owner exists.
  - Inserts it with `public: true, showInMarket: true`.
  - Pre-generates `Random.id(32)` for every node.
  - Remaps `parentId`, the legacy `parent`, `ancestors[]` and `referenceNodeId`, and forces `root` to the new library.
  - Calls `rebuildNestedSets`.
  — same compare (file `app/imports/server/importLibraries.js`, +149)
- The browser-side DDP fetch scripts went into `scripts/`, which ardunaline's `.gitignore` excludes (it contains `build` and `scripts/`). So the published repo has only the server half. — [ardunaline .gitignore](https://raw.githubusercontent.com/ardunaline/DiceCloud/develop/.gitignore); [compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...ardunaline:develop)
- JPugetGil:
  - A library, or a library collection with its libraries, "can be saved as a file from its page" by its owner, editors or admins, or by anyone when copying is allowed.
  - Admins import files on the Library page "from this instance or another one". Libraries and properties keep their IDs so cross-library references hold.
  - An existing library is skipped unless the admin chooses replace, which keeps its owner, sharing and subscribers.
  - Commit: "feat: export et import de bibliothèques dans l'application" (export and import of libraries in the app, 2026-10-04).
  — [JPugetGil README](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/README.md); [compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...JPugetGil:develop)
- JPugetGil's deploy flow is `./dicecloud.sh libraries ~/libraryImport <username>`:
  - It imports every `data/*.gz` snapshot and turns each `data/manifest*.json` into a library collection.
  - Its README says the tools "are kept out of git, in `tools/libraryImport`".
  - It also offers `./dicecloud.sh import "<URL>"` to copy a whole MongoDB, such as Atlas.
  - `DEFAULT_LIBRARY_COLLECTIONS` and `DEFAULT_LIBRARIES` auto-subscribe new accounts.
  — [JPugetGil deploy/README.md](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/deploy/README.md)
- JPugetGil also added an SRD 5.1 bestiary ("Feat: SRD 5.1 bestiary", 2026-10-07). — [compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...JPugetGil:develop)
- Upstream issue #99 ("Export/Import feature for DiceCloud instances", opened 2017) was closed by ThaumRystra on 2023-06-07, saying the core was resolved by "the ability to upload and download v2 character archives". That covers characters, not libraries. — [Issue #99](https://github.com/ThaumRystra/DiceCloud/issues/99)
- Upstream issue #279 (2021): a self-hoster's documented `Libraries.insert(...)` SRD-library snippet failed. The maintainer said the procedure is "no longer valid" on version-2 and applies only to master/v1. — [Issue #279](https://github.com/ThaumRystra/DiceCloud/issues/279)
- Upstream already has `importCharacterFromDiceCloudInstance.js` for importing characters from another instance (local checkout, `app/imports/api/creature/creatures/methods/`). JPugetGil documents `public.disallowCreatureApiImport` to turn this off. — local file; [JPugetGil README](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/README.md)

### Inferences
- ardunaline's server method is the most portable path for the user's fork: one new file, no changes to upstream schemas. The client half (DDP to dicecloud.com in the browser) has to be rewritten, because it was not published. Licensing and terms of copying content from dicecloud.com were not examined.
- JPugetGil's file format is the more robust design: it keeps IDs and supports replace semantics. But it targets Meteor 3 async APIs, so it cannot be ported directly to a Meteor 2.16 fork.

### Gaps
- The JSON schema of JPugetGil's export file was not inspected.
- Whether copying dicecloud.com public libraries is allowed by the libraries' authors or licences was not researched.

## Has any fork modified DiceCloud for a non-5e or homebrew system?

### Takeaway
No fork found replaces the core d20 roll or the 5e rules engine, so the user's Reverent Abyss 2d10 fork appears to be unique. The nearest cases are larphq, which retunes point-buy and character caps for a LARP and adds a 3D dice overlay, and Newtim/DiceCloudRifts, which is named for Rifts but contains no system changes and is stale. JPugetGil stays 5e but adds engine features (legendary actions, durations, targeting) that would collide with RA's engine edits if merged.

### Cited Findings
- larphq: "feat(characters): one-char cap, deletion locks, point-engine demo", which modifies `computePointBuy.js` (+18/−16) and `PointBuySpendForm.vue`. Also "feat(dice): 3D dice overlay with BabylonJS physics and player colors", which modifies `RollInput.vue` and adds `DiceTrayOverlay.vue`. — [larphq compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...larphq:develop)
- Newtim/DiceCloudRifts is 1 commit ahead ("Create CNAME", 2019-10-23) and 1575 behind. — [compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/master...Newtim:master)
- fefu-marquez/DiceCloudButBeyond, JonathanStranger/DiceCloudUnchained, Dreathwings/DnD and RickPeukert/caravana-dnd have names that suggest customisation, but DiceCloudButBeyond and Dreathwings have 0 commits ahead and DiceCloudUnchained only has Vercel files. caravana-dnd was not compared, but it was last pushed on the same date as upstream (2026-05-10), which suggests no own commits. — [forks API p2](https://api.github.com/repos/ThaumRystra/DiceCloud/forks?sort=stargazers&per_page=100&page=2); compare API
- JPugetGil engine features: "actions légendaires, recharge, résistance légendaire, régénération" (legendary actions, recharge, legendary resistance, regeneration), "durées ancrées sur la source ou sur la fin du tour" (durations anchored to the source or to the end of the turn), and turn start and end events. 101 files under `api/engine` were touched. — [compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...JPugetGil:develop)

### Inferences
- No upstream-compatible "rules plugin" pattern exists in any fork to borrow. RA's approach of new `RA_*.ts` constants and a shared `rollCoreDice` is already more modular than anything observed.
- larphq's 3D dice overlay hooks into `RollInput.vue`. It could be adapted to show 2d10 keep-highest rolls, but that would need changes to `RollInput.vue`, which the RA fork may also touch.

### Gaps
- Forks of forks, and repos that copied DiceCloud without using GitHub's fork button, were not searched. GitHub code search needs authentication.

## Are there community guides about self-hosting DiceCloud v2 and the issues encountered?

### Takeaway
I found very little community material outside GitHub. The richest self-hosting guide found is JPugetGil's `deploy/README.md`, a step-by-step for Ubuntu Server, Cloudflare tunnel, Mongo 7 replica set, S3, Brevo SMTP, admin bootstrap and library import. Upstream issues record recurring pain points: ROOT_URL on a LAN, outdated SRD-library instructions, and docs. Reddit could not be fetched, and web searches returned no relevant blog guides or Docker Hub images.

### Cited Findings
- JPugetGil's `deploy/README.md` covers:
  - The host machine (Ubuntu 22.04+, a laptop BIOS set to AC power).
  - DNS moved to Cloudflare.
  - A tunnel whose public hostname points to `http://dicecloud:3000`.
  - `./dicecloud.sh install|start|admin|libraries|import`.
  - Daily backups (7 kept, optionally to S3).
  - A warning that the first build takes 10–20 minutes.
  — [JPugetGil deploy/README.md](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/deploy/README.md)
- The JPugetGil README says to make the first admin by running `db.users.updateOne({ username: '<username>' }, { $addToSet: { roles: 'admin' } })` in `meteor mongo`. — [JPugetGil README](https://raw.githubusercontent.com/JPugetGil/DiceCloud/develop/README.md)
- Upstream issues matching "self host": #311 "Self Hosting DiceCloud" (2023, ROOT_URL), #279 "Trouble Adding the SRD library" (2021), #211 "Improve local hosting documentation" (2019, closed, 0 comments) and #99 "Export/Import" (closed 2023). — [GitHub issue search](https://github.com/ThaumRystra/DiceCloud/issues?q=is%3Aissue+self+host)
- Arbel-arad "added container install instructions to readme" (2025-03-25). — [Arbel-arad compare](https://api.github.com/repos/ThaumRystra/DiceCloud/compare/develop...Arbel-arad:develop)
- An Obsidian community plugin, "dicecloud importer", imports public DiceCloud v2 characters as notes. It is a consumer of the API, not a self-hosting tool. — [Obsidian plugin](https://community.obsidian.md/plugins/dicecloud-importer)

### Inferences
- Self-hosting know-how mostly lives in individual fork READMEs and Dockerfiles, not in community guides. The recurring failure modes are:
  - Wrong `ROOT_URL`.
  - EOL Debian or nodesource bases.
  - Meteor refusing to install as root.
  - Meteor/Node version mismatch.
  - node-sass on ARM.
  - Uploads lost without S3.
  - No way to get SRD/official libraries.

### Gaps
- Reddit (r/DiceCloud) could not be fetched: the tool is blocked from reddit.com. Discord-shared docs are not publicly indexable. Web searches for "self-host DiceCloud v2 docker reddit" and for a "dicecloud docker hub image" returned no relevant results. — [search results, e.g. hub.docker.com](https://hub.docker.com/r/qwedfrnhgef/selfhost/tags) (unrelated)
- Upstream GitHub Discussions and the DiceCloud Discord were not checked.
