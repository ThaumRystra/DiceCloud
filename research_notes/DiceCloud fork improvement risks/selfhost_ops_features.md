# Self-hosting ops, performance, security and fork features for the DiceCloud x Reverent Abyss fork (Meteor 2.16 + MongoDB on Oracle Always Free A1)

Local-code citations use repo-relative paths (repo at C:\Users\User\DiceCloud-x-Reverent-Abyss, branch develop, read 2026-10-20). Web sources are linked inline.

## Deployment: what has to change to run on an Ampere A1 (ARM64) VPS?

### Takeaway
The Dockerfile as written cannot produce a working fork deployment on A1. It clones **upstream** ThaumRystra/DiceCloud, not the fork, so none of the RA changes ship. It also builds for `os.linux.x86_64`, and Meteor 2.x has no Linux ARM64 tool. A Meteor 2 server bundle is mostly JavaScript, so the practical route is to build the bundle on x86 (CI or a dev PC) and then run `npm install` in `programs/server` on the ARM host under a matching Node 14 build. The other option is upgrading to Meteor 3.x, which supports Linux ARM, but that is a large migration.

### Cited Findings
- `Dockerfile` does `git clone https://github.com/ThaumRystra/DiceCloud dicecloud`, installs Node 14 via `deb.nodesource.com/setup_14.x`, runs `meteor build --directory ~/dc/ --architecture os.linux.x86_64`, then `npm install` in `bundle/programs/server`, with `ENTRYPOINT node main.js` — local repo `Dockerfile`
- A Meteor maintainer (April 2025) said ARM support in 2.x was Mac-only, starting at 2.5.6. They said "Linux ARM support arrived in Meteor 3.x" and that pipelines stopped building ARM for Meteor 2 after the move to 3 — [Meteor forums](https://forums.meteor.com/t/release-2-16-1-beta-0-is-intel-only-can-arm64-be-added/63405)
- Meteor Guide on custom deployment: "it's important that you build your bundle for the correct architecture". It runs `(cd programs/server && npm install)` on the target and warns "If you use a mis-matched version of Node when deploying your application, you will encounter errors!" — [Meteor Guide: Deployment](https://guide.meteor.com/deployment.html)
- `docker-compose.yml` uses `image: mongo:latest`, publishes the app on `'3000:3000'` with `ROOT_URL=http://localhost:3000`, and sets `METEOR_SETTINGS={"public":{"environment":"production","disablePatreon":true}}` and a placeholder `MAIL_URL=smtp://EMAIL:PASSWORD@SERVER:PORT`. No `restart:` policy, no oplog URL and no network isolation are configured — local `docker-compose.yml`
- Meteor 2.16 reportedly bundles MongoDB Node driver 4.17.2, which supports MongoDB 7 minus its new features. Support for MongoDB 8 on Meteor 2.16 is unconfirmed — [Meteor forums (summarised via search)](https://forums.meteor.com/t/solved-mongodb-server-version/60647)
- MongoDB 7.0 EOL is Aug 31, 2027, after MongoDB extended the 7.0/8.0 lifecycles in Sept 2025. Older pages saying 2026 are stale — [MongoDB: longer lifecycles](https://www.mongodb.com/products/updates/longer-lifecycles-for-mongodb-7-0-and-8-0/)
- A1 Always Free, as fetched 2026-10-20: "first 1,500 OCPU hours and 9,000 GB hours per month", equivalent to **2 OCPUs / 12 GB**, as one instance or two 1-OCPU instances. Block storage is 200 GB total (boot plus block). Instances must be in the home region — [Oracle Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm). This conflicts with the long-cited 3,000 OCPU-h / 18,000 GB-h (4 OCPU / 24 GB) allowance from earlier years. Either Oracle reduced it or the fetch summary is wrong, so the writer should flag it and recommend checking the console's Limits page. Even 2 OCPU / 12 GB is ample for this workload.

### Inferences
- Candidate D1, "Build fork bundle on x86, run on ARM": use a multi-stage Dockerfile or GitHub Actions. Stage 1 (amd64): `meteor build --server-only --architecture os.linux.x86_64` from the fork's own source (COPY, not git clone upstream). Stage 2 (arm64 base `node:14.21.3-bullseye-slim` or similar): copy the bundle, then `cd programs/server && npm install --omit=dev` so native modules (bcrypt, fibers) compile for arm64. Risks: `fibers` must compile on arm64 Node 14, which needs build tools (python3, make, g++) in the image. The `@aws-sdk/client-s3` dependency is pure JS. Node 14 has been EOL since April 2023, so the Node runtime gets no security updates. That is an unavoidable cost of staying on Meteor 2.x. To verify: build the bundle and check `npm install` success and boot on an A1 instance before committing.
- Candidate D2, "Pin MongoDB": replace `mongo:latest` with `mongo:7.0`. `latest` is now 8.x, which is unconfirmed with the 4.17 driver, and an unattended pull could jump major versions and refuse to start on old data files (feature compatibility version). The official mongo image has arm64 builds, and A1 (Neoverse N1, ARMv8.2) meets MongoDB's ARMv8.2-A requirement. That is from background knowledge; verify on first boot.
- Candidate D3, "Meteor 3 upgrade": the only way to native ARM tooling and supported Node (20/22). It is very large for DiceCloud: fibers removal and async-ifying all server collection calls, for example `Meteor.wrapAsync` in `archiveCreatureToFile.js` and sync `findOne` everywhere. Treat it as a separate project, not an ops tweak.
- Candidate D4: set `ROOT_URL=https://<your-domain>`, bind the app to `127.0.0.1:3000` (or only to the compose network) and put a reverse proxy in front. ROOT_URL drives email links and OAuth redirect URIs.
- Because of the 200 GB block-storage cap, keep the boot volume at the default ~47–50 GB and put Mongo data on the same volume or a small block volume. DiceCloud data for 5–10 users is likely well under 1 GB.

### Gaps
- Not verified whether `fibers@5` (Meteor 2.16's dependency) compiles cleanly on linux-arm64 with Node 14.21. No source found; needs an empirical test.
- The Oracle page fetch returned 2 OCPU/12 GB for A1. I could not reconcile this with the widely cited 4 OCPU/24 GB in this session. The writer should present both and recommend checking the live console limits.
- No authoritative confirmation found of MongoDB 8 compatibility with the Meteor 2.16 driver.

## Performance: what matters for ~5–10 concurrent users?

### Takeaway
At this scale almost none of the heavy tuning matters. The fork **does not actually use redis-oplog**: the package is absent from `.meteor/packages`, and the code calls `startCaching?.()` / `disableRedis?.()` with optional chaining, so they are no-ops. Without `MONGO_OPLOG_URL`, Meteor polls Mongo for reactivity, which adds latency (up to ~10 s for some changes) and CPU. The single worthwhile change is a single-node replica set plus `MONGO_OPLOG_URL`. Redis is unnecessary. Gzip is already handled by Meteor's webapp for static assets, and a CDN is pointless for this group size.

### Cited Findings
- `app/redis-settings.json` contains a `redisOplog` block (Redis at 127.0.0.1:6379, `cacheTimeout`, `raceDetection`, etc.) — local repo
- `.meteor/packages` contains no `cultofcoders:redis-oplog` or `disable-oplog` entry. Grep of `.meteor/packages`, `.meteor/versions` and `package.json` for "redis" returns nothing — local repo
- `imports/server/config/redisCaching.js` is just `LibraryNodes.startCaching?.();`. `imports/server/rest/apiPublications/healthCheck.js` calls `HealthCheckCollection.disableRedis?.();`. Both are optional-chained, so they silently no-op without redis-oplog — local repo
- redis-oplog is installed with `meteor add cultofcoders:redis-oplog` plus `meteor add disable-oplog`, should be first in `.meteor/packages`, and reads a `redisOplog` settings key. It is aimed at scaling, chat/games and custom reactivity. The repo has 57 open issues, no Releases, and no stated Meteor 2/3 compatibility — [cult-of-coders/redis-oplog](https://github.com/cult-of-coders/redis-oplog)
- Without an oplog URL, Meteor falls back to polling. Oplog tailing requires a replica set and access to the `local` database. The common Compose pattern is `mongod --replSet rs0 --bind_ip_all` with an `rs.initiate({_id:"rs0",members:[{_id:0,host:"mongo:27017"}]})` healthcheck, where the member host must match the name the app uses. App env: `MONGO_OPLOG_URL=mongodb://mongo:27017/local` — [search summary: justdo.com compose](https://justdo.com/docker-compose.yml), [Rocket.Chat replica set docs](https://docs.rocket.chat/docs/configure-a-replica-set-for-mongodb)
- The app already sets `NO_MERGE_MULTI` publication strategy for `creatureProperties`, `creatureVariables` and `libraryNodes`, to cut server memory — local `imports/server/config/publicationStrategies.js`
- Meteor Guide: CDN via `WebAppInternals.setBundledJsCssPrefix`. Monitoring should focus on DDP response times. APM options are Monti APM and Meteor Elastic APM — [Meteor Guide: Deployment](https://guide.meteor.com/deployment.html)

### Inferences
- Candidate P1, "Single-node replica set + oplog": high value, low cost. Risk: replica set **with auth** requires a `keyFile` shared by members (even for one node), so combining it with Mongo auth adds setup friction. The oplog user needs read on `local`. The hostname in `rs.initiate` must match the compose service name (`dicecloud-db`). Converting existing data is fine: restart with `--replSet` and run `rs.initiate()` once.
- Candidate P2, "Remove or implement redis-oplog": either delete `redis-settings.json` and the optional calls to avoid confusion, or leave them. Adding Redis for 10 users adds a process and failure mode for no gain. Don't do it.
- Candidate P3, "Node memory": set `--max-old-space-size` (for example 1024–2048 MB) to keep a heap leak from taking the VM down. With 12–24 GB RAM this is a safety cap, not a performance tweak. The idle-reclaim memory rule (below) is the bigger memory concern.
- Candidate P4, "Proxy compression/caching": let Caddy or nginx gzip/zstd the HTML/DDP-adjacent HTTP and cache `/*.js?hash`/`/*.css?hash` (Meteor hashes bundle URLs, so long cache headers are safe). A CDN (Cloudflare proxy) only helps distant users and makes websockets slightly trickier, so it is optional.
- Monti APM has a free tier, but it is overkill. Uptime Kuma plus `docker stats` is enough.

### Gaps
- No measured numbers for Meteor polling overhead at this scale; the "~10 s poll" figure is background knowledge of Meteor's default `pollingIntervalMs`, not sourced in this session.

## Security hardening

### Takeaway
The biggest risks are configuration risks: default `meteor/meteor` Mongo root creds, open public signup, plain HTTP on port 3000, and Google/Patreon OAuth buttons left visible. Meteor's built-in login/createUser/reset rate limit (5 per 10 s per session) and the app's existing RateLimiterMixin cover brute force adequately for a private group. The highest-value code change is invite-only or allowlisted signup via `Accounts.config({forbidClientAccountCreation})` or `Accounts.validateNewUser`.

### Cited Findings
- `docker-compose.yml` sets `MONGO_INITDB_ROOT_USERNAME=meteor` / `MONGO_INITDB_ROOT_PASSWORD=meteor`, and the app connects as root (`mongodb://meteor:meteor@dicecloud-db:27017`). The Mongo service has no `ports:` mapping, so 27017 is not published to the host by this file, but the app's `3000:3000` is published on all interfaces — local `docker-compose.yml`
- A grep for `Accounts.config`, `forbidClientAccountCreation` and `validateNewUser` across `imports/`, `server/` and `client/` found nothing. Only `Accounts.onCreateUser` exists (`imports/api/users/Users.js`, which increments default library subscriber counts). The client calls `Accounts.createUser` from `client/ui/pages/Register.vue`, so signup is open to anyone who finds the URL — local repo
- Meteor accounts default DDPRateLimiter rules "rate limit logins, new user registration and password reset calls to a limit of 5 requests per 10 seconds per session". `forbidClientAccountCreation`: "Calls to createUser from the client will be rejected". `restrictCreationByEmailDomain` restricts by email domain. `Accounts.validateNewUser` aborts creation if a callback returns false. `loginExpirationInDays` defaults to 90 — [Meteor v2 Accounts docs](https://v2-docs.meteor.com/api/accounts-multi.html)
- The app has a global subscription rate rule `DDPRateLimiter.addRule({type:'subscription'}, 50, 10000)` (`imports/server/publications/publicationRateLimit.js`). Methods use `RateLimiterMixin`, for example archive/restore at 10 per 5 s. `.meteor/packages` includes `ddp-rate-limiter` and `rate-limit`, and no `insecure`/`autopublish` — local repo
- Meteor security checklist: use Methods rather than allow/deny, apply rate limiting, no insecure/autopublish, filter publication fields, no secrets in `public` settings, set secure headers with Helmet and use CSP. "Every production Meteor app that handles user data should run with SSL." Meteor has built-in password-login rate limiting — [Meteor Guide: Security](https://guide.meteor.com/security.html)
- A grep found no `.allow(` / `.deny(` rules in app code — local repo (consistent with the methods-only pattern)
- `SignIn.vue` / `Register.vue` render "Sign in with Google" (`Meteor.loginWithGoogle`) and a Patreon login (`Meteor.loginWithPatreon`). These fail unless `ServiceConfiguration` entries exist — local `imports/client/ui/pages/SignIn.vue`

### Inferences
- Candidate S1, "Invite-only signup": options in order of effort:
  - (a) Create accounts yourself (`meteor shell` / `Accounts.createUser` server-side) and set `forbidClientAccountCreation: true`, with enrollment emails via `Accounts.sendEnrollmentEmail`. The `enrollAccount` template already exists in `accountsEmailConfig.js`. This needs working MAIL_URL, or you hand out the enrollment link from logs.
  - (b) `Accounts.validateNewUser` checking an email allowlist from `Meteor.settings` (private key).
  - (c) A shared signup code field. This is weaker and needs UI work.

  Risk: the existing `Invites` collection is tied to Patreon tiers (`imports/api/users/patreon/tiers.js`, `InviteDialog.vue`), so reusing it for gating needs more code than (a) or (b).
- Candidate S2, "Mongo creds": generate a strong root password and a separate least-privilege app user (`readWrite` on the app DB, plus `read` on `local` for the oplog). Keep Mongo off host ports. If you ever map a port for admin, bind it to `127.0.0.1:27017`. Docker-published ports bypass UFW/iptables INPUT rules on Ubuntu (background knowledge), so not publishing is the real protection. Oracle's VCN security list blocks 27017 by default unless opened.
- Candidate S3, "Reverse proxy + HTTPS": Caddy is the lowest-effort option, with automatic Let's Encrypt and transparent WebSocket proxying via `reverse_proxy localhost:3000`. Set `HTTP_FORWARDED_COUNT=1` so Meteor sees real client IPs, which the rate limiter and logs depend on. Open 80/443 in **both** the OCI security list and the instance's own iptables. Oracle's Ubuntu/Oracle Linux images ship restrictive iptables rules (background knowledge, verify).
- Candidate S4, "Headers/CSP": add Helmet via `WebApp.connectHandlers` or set headers in Caddy. A strict CSP needs testing because Vue/Vuetify inline styles and any external images in markdown will break under `default-src 'self'`. Start with HSTS, X-Content-Type-Options, frame-ancestors and Referrer-Policy.
- Candidate S5, "Hide unused OAuth": remove or flag-hide the Google and Patreon buttons, and optionally remove `accounts-google` / `accounts-patreon` from `.meteor/packages` to reduce attack surface and user confusion.
- Candidate S6, "SSH": key-only auth (the Oracle default), disable password auth, fail2ban or `sshguard`, unattended-upgrades. Optionally restrict port 22 in the OCI security list to your IP, or use the free OCI Bastion service.
- Secrets: move S3 and SMTP creds out of `docker-compose.yml` into an `.env` file not committed to git. The guide says never to put secrets in `public` settings.

### Gaps
- Did not audit every publication and method for permission checks. That is out of scope for ops notes; a separate code-security review would be needed.

## Oracle Always Free specifics

### Takeaway
The material Oracle risk is **idle reclamation**: CPU p95, network and memory all below 20% over 7 days. A DiceCloud server for a handful of players will look idle most weeks. Mitigations are upgrading to Pay-As-You-Go (Always Free resources stay free and are reportedly exempt from idle reclaim) or a keep-busy workload. Other limits (10 TB egress, 200 GB block, 20 GB Object Storage, 5 volume backups) are generous for this use.

### Cited Findings
- Exact rule: "Idle Always Free compute instances may be reclaimed by Oracle… idle if, during a 7-day period, the following are true: CPU utilization for the 95th percentile is less than 20%; Network utilization is less than 20%; Memory utilization is less than 20% (applies to A1 shapes only)" — [Oracle Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm)
- The threshold rose from 10% (early 2023) to 15% (Apr 19, 2023) and now 20%. Community sources say paid (PAYG) accounts are not subject to reclamation, and some users run "NeverIdle"/"LookBusy" load generators. These are third-party and unverified — [51sec blog](https://blog.51sec.org/2023/02/oracle-cloud-cleaning-up-idle-compute.html)
- "Out of host capacity" is a temporary shortage in the home region. Options are another availability domain, retry, or upgrade to PAYG. Oracle does not charge for Always Free resources after upgrading — [Oracle Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm)
- Limits from the same page:
  - Block storage: 200 GB total, home region.
  - Volume backups: 5 total.
  - Object Storage: 20 GB and 50,000 API requests/month on Always-Free-only tenancies. "If usage exceeds 20 GB when the trial ends, all objects are deleted".
  - Outbound data: 10 TB/month.
  - Monitoring and Notifications are free (1,000 email notifications/month).
  - Email Delivery: 3,000 emails/month.
  - **Outbound TCP port 25 is blocked by default.**
  - Load balancer: 10 Mbps.
  - Up to 2 VCNs.

  [Oracle Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm)

### Inferences
- Candidate O1, "Upgrade to PAYG with a budget alert": the cleanest anti-reclaim measure. Set a $1 budget alert and compartment quotas so nothing billable gets created by accident. Risk: needs a card and a possible verification hold; a mistake can incur charges.
- Candidate O2, "Keep-busy": the memory rule is the easiest to satisfy legitimately on A1. Mongo's WiredTiger cache plus a Node heap can sit above 20% of 12 GB (~2.4 GB) if you raise the WiredTiger cache. Since reclamation reportedly needs **all** conditions true, keeping one metric above 20% should suffice, but that reading comes from the community, not an Oracle clarification. Risk: synthetic CPU burners are against the spirit of the ToS. Prefer real memory use, or PAYG.
- Candidate O3, "Capacity": once you have an A1 instance, don't terminate it to resize. Stop/resize in place or keep it. Re-acquiring capacity in popular regions can take days of retries.
- Reclamation means losing the instance, so off-box backups (next section) are mandatory, not optional.

### Gaps
- Could not confirm from Oracle docs that PAYG accounts are exempt from idle reclamation (community claim only).
- The conflicting A1 allowance (2/12 vs 4/24) noted above is unresolved.

## Reliability: backups, restarts, monitoring, logs

### Takeaway
There is currently no backup, restart policy or log rotation. A cron'd `mongodump --archive --gzip` shipped to OCI Object Storage (S3-compatible, 20 GB free) or another off-site target, plus `restart: unless-stopped`, Docker json-file log limits and Uptime Kuma hitting `/api/status`, covers it. One critical hidden issue: **uploaded files and creature archives are stored inside the container filesystem when S3 isn't configured**, so they are lost on container rebuild.

### Cited Findings
- `createS3FilesCollection` uses S3 only if `Meteor.settings.s3` (or the `S3` env JSON) has key, secret, bucket and endpoint. Otherwise it stores to `storagePath` — local `imports/api/files/server/s3FileStorage.ts`
- Production `storagePath` is `'assets/app/archiveCreatures'` (`ArchiveCreatureFiles.js`) and `'assets/app/userImages'` (`imports/api/files/userImages/UserImages.ts`). These are relative paths inside the bundle in the container, and `docker-compose.yml` mounts a volume only for Mongo (`./dicecloud/data/db:/data/db`) — local repo
- `archiveCreatureToFile` writes the JSON file and then **deletes the creature from Mongo** when `!Meteor.settings.useS3`. The archived character then exists only as a file on that path — local `imports/api/creature/archive/methods/archiveCreatureToFile.js`
- The S3 client is hardcoded `region: 'ENAM'` (Backblaze/Linode-style) with a custom `endpoint`, so any S3-compatible store can be used by endpoint — local `s3FileStorage.ts`
- A health check endpoint exists at `/api/status`, documented as `GET https://dicecloud.com/api/status` → `{ status: ok }` — local `private/docs/defaultDocs.json`, `imports/server/rest/apiPublications/healthCheck.js`
- Oracle Object Storage: 20 GB free; 5 free block-volume backups — [Oracle Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm)

### Inferences
- Candidate R1, "Persist file storage" (high priority, trivial): mount a volume at the bundle's `assets/app` subdirs. The absolute path is `/home/mt/dc/bundle/programs/server/assets/app/{archiveCreatures,userImages}` in the current Dockerfile, but this must be verified, since the relative path resolves against the process cwd. Or configure S3 against OCI Object Storage's S3-compatibility endpoint. Risk with OCI S3 compat: needs "Customer Secret Keys" and the path-style endpoint `https://<namespace>.compat.objectstorage.<region>.oraclecloud.com` (background knowledge, verify). The hardcoded `region: 'ENAM'` may need changing to the OCI region for SigV4 signing.
- Candidate R2, "mongodump nightly": `docker exec dicecloud-db mongodump --archive --gzip -u ... --authenticationDatabase admin > /backups/dc-$(date +%F).gz`, keep 7 daily and 4 weekly, then `rclone` or `oci os object put` to Object Storage, plus a copy off Oracle entirely (for example Backblaze B2 free 10 GB, or a home PC). An account-level Oracle problem would take Object Storage with it. Also back up the file-storage volume. Test restores quarterly with `mongorestore --drop` into a scratch container.
- Candidate R3, OCI boot/block volume backup policy (5 free) as a second layer. These are crash-consistent only; mongodump is the authoritative backup.
- Candidate R4: add `restart: unless-stopped` to both services, a Mongo healthcheck, and `depends_on: condition: service_healthy` for the app. This also fixes the startup race with replica-set init.
- Candidate R5, "Logs": `logging: driver: json-file, options: {max-size: "10m", max-file: "3"}` per service. Without it, Docker json logs grow unbounded on a 47 GB boot volume.
- Candidate R6, "Monitoring": Uptime Kuma (ARM64 image available) watching `https://domain/api/status` and the TLS cert expiry, alerting to Discord/email. Ideally run it off-box (another free micro instance or a home machine), or use a free external pinger, because an on-box monitor dies with the box. OCI Monitoring and Notifications are free for VM metrics alarms.
- Candidate R7, "Updates": Watchtower is risky with `mongo:latest`. Pin images and update manually.

### Gaps
- Did not confirm the exact runtime cwd of the Meteor bundle for the relative `assets/app/...` path; test by uploading an image and running `find / -name userImages` in the container.

## Fork features: library JSON export/import

### Takeaway
Feasible and moderately easy. The creature archive pattern (build plain object → JSON → `FilesCollection.write`; upload → `readJSONFile` → migrate → verify → `batchInsert`) maps directly onto libraries (a `Libraries` doc plus its `LibraryNodes` tree). The tree helpers needed for safe import already exist: `renewDocIds`, `setLineageOfDocs` and `rebuildNestedSets`, as used by `copyLibraryNodeTo` / `duplicateLibraryNode`. A simpler variant skips FilesCollection entirely: export via a method that returns JSON for client-side download, and import via a method taking parsed JSON with a size cap.

### Cited Findings
- Creature archive export: `getArchiveObj(creatureId)` gathers `creature`, `properties` (via `getFilter.descendantsOfRoot`), `experiences` and `logs`, with `meta: {type: 'DiceCloud V2 Creature Archive', schemaVersion, archiveDate}`. `archiveCreature` writes `JSON.stringify(archive)` with `ArchiveCreatureFiles.write(...)` and removes the creature — local `imports/api/creature/archive/methods/archiveCreatureToFile.js`
- Restore: rejects newer `schemaVersion`, runs `migrateArchive`, then `verifyArchiveSafety`. It refuses if the `_id` already exists, sets `owner = userId`, `Creatures.insert`, then `batchInsert` (`mikowals:batch-insert`) of properties/experiences/logs, and rolls back on failure. Restore **keeps original `_id`s** — local `restoreCreatureFromFile.js`
- `verifyArchiveSafety` only checks that each log, experience and prop belongs to the archive's creature (`prop.root?.id === creatureId`) and truncates logs. Schema validation comes from `archiveSchema` (`CreatureSchema`, `CreaturePropertySchema`) — local `verifyArchiveSafety.js`, `ArchiveCreatureFiles.js`
- `ArchiveCreatureFiles` limits upload to 10 MB and JSON extension, and charges the user's file-storage quota (`assertUserHasFileSpace`, `incrementFileStorageUsed`) — local `ArchiveCreatureFiles.js`
- Library model: `Libraries` (name, description, showInMarket, subscriberCount, plus `SharingSchema` owner/readers/writers). Nodes carry `root: {collection:'libraries', id}`, `parentId`, nested-set `left`/`right`, and inserts call `rebuildNestedSets(LibraryNodes, rootLibrary._id)` after `assertEditPermission` — local `imports/api/library/Libraries.js`, `LibraryNodes.ts`
- `copyLibraryNodeTo` / `duplicateLibraryNode` use `renewDocIds({docArray})`, `setLineageOfDocs` and `rebuildNestedSets`, with a `DUPLICATE_CHILDREN_LIMIT = 500` — local `imports/api/library/methods/copyLibraryNodeTo.js`
- There is a separate creature import path, `importCharacterFromDiceCloudInstance` (gated by `Meteor.settings.public.disallowCreatureApiImport`), which imports API-format creatures via `migrateApiCreature` and `verifyArchiveSafety` — local `imports/api/creature/creatures/methods/importCharacterFromDiceCloudInstance.js`
- Libraries are created subject to tier limits (`getUserTier`). With `disablePatreon: true`, every user gets `PATREON_DISABLED_TIER` — local `Libraries.js`, `imports/api/users/patreon/tiers.js`

### Inferences
- Candidate F1, "Library export": method `libraries.exportJson({libraryId})` that runs `assertViewPermission` (or copy permission) and returns `{meta:{type:'DiceCloud V2 Library Archive', schemaVersion}, library, nodes: LibraryNodes.find({'root.id': libraryId, removed: {$ne:true}}).fetch()}`. The client turns it into a Blob download. No FilesCollection is needed, which avoids the storage-quota and container-persistence issues. Strip `owner`/`readers`/`writers` from the export. Effort: small (~1 method plus 1 button).
- Candidate F2, "Library import": method or upload that:
  - validates `meta.type` and `schemaVersion`;
  - creates a **new** library owned by the importer;
  - runs `renewDocIds` on all nodes (unlike creature restore, so the same library can be imported twice or shared between instances without `_id` collisions);
  - rewrites `root` to the new library and remaps `parentId`;
  - validates each node against the LibraryNodes schema (`LibraryNodes.simpleSchema().validate` per node type, since nodes are polymorphic by `type`);
  - `batchInsert`s, then `rebuildNestedSets`.

  Risks:
  - (a) `renewDocIds` handles parentId remapping in copy flows, but cross-node references (slot fillers, `updateReferenceNode` reference nodes, and any `libraryNodeId` pointers stored in creature props) will break or point to the old IDs. Check `updateReferenceNode.js` for which fields hold references.
  - (b) There is no library migration function equivalent to `migrateArchive`, so older exports need either a schemaVersion gate or migration reuse (check `imports/migrations` for library-node migrations).
  - (c) Large libraries (SRD-sized, thousands of nodes) can exceed DDP message size and the 500-node limit used elsewhere. Use FilesCollection upload (10 MB cap pattern) or chunking for those.
  - (d) The safety check must ensure every node's `root.id` is rewritten server-side. Never trust client values for `owner`/`root`.

  Effort: medium.
- Candidate F3: the same export format enables **migrating libraries from dicecloud.com** to the self-host, for any library the user can view upstream. The upstream REST API's support for library export is unverified.

### Gaps
- Did not read `parentingFunctions` (`renewDocIds` / `setLineageOfDocs`) in detail to confirm exactly which reference fields it remaps.
- Did not check whether upstream DiceCloud already has a library export branch or issue.

## Fork features: dicecloud.com hardcoding and upstream-specific config

### Takeaway
There are only a handful of hardcoded `dicecloud.com` references, all easy fixes using `Meteor.absoluteUrl()` (derived from ROOT_URL) or a settings key. The bigger self-host concerns are Patreon/tier UI (already neutralised by `disablePatreon`), visible Google and Patreon OAuth buttons, the Discord webhook feature, S3 config, and `DEFAULT_LIBRARIES` env vars.

### Cited Findings
Hardcoded references (local grep of `imports/`, `client/` and `server/` for js/ts/vue/html):
- `imports/client/ui/user/InviteDialog.vue:79`: `` `https://dicecloud.com/invite/${token}` ``. Invite links point at upstream.
- `imports/server/config/accountsEmailConfig.js:3`: `Accounts.emailTemplates.from = 'no-reply@dicecloud.com'`. The From address must be a domain your SMTP provider is authorised to send for, or mail gets rejected or spam-foldered. `siteName = 'DiceCloud'`.
- `imports/server/config/emailTemplate.js:51`: email logo `https://dicecloud.com/favicon-96x96.png`.
- `imports/client/ui/creature/character/printedCharacterSheet/CharacterSheetPrinted.vue:112`: `new URL(props?.href, 'https://dicecloud.com')` as the base URL for links on printed sheets.
- `imports/client/ui/pages/SignIn.vue:69`: a "Version 1 is still available at v1.dicecloud.com" link.
- `imports/client/ui/markdownCofig.js:10`: commented-out `baseUrl` (harmless).
- `private/docs/defaultDocs.json`: in-app API docs reference `https://dicecloud.com/api/...` (cosmetic).

Patreon links and logic:
- `patreon.com` links appear in `Sidebar.vue:107`, `Home.vue:170`, `CharacterList.vue:34`, `TierTooLowDialog.vue:19` and `PatreonLevelTooLow.vue:16`.
- `imports/api/users/patreon/updatePatreonDetails.js` calls the Patreon API, and `server/main.js` imports `updatePatreonOnLogin`.
- `tiers.js` returns `PATREON_DISABLED_TIER` when `settings.public.disablePatreon` is set.

Other upstream-specific config:
- OAuth: the `accounts-google` and local `accounts-patreon` packages, with buttons in `SignIn.vue` / `Register.vue`.
- File storage: `S3` env / `settings.s3` with `region: 'ENAM'`.
- `DEFAULT_LIBRARIES` / `DEFAULT_LIBRARY_COLLECTIONS` env (comma-separated IDs auto-subscribed for new users; `Users.js:11-12`). These are upstream IDs and will be empty on a fresh DB.
- Discord: `imports/server/discord/sendWebhook.js` uses a per-creature `settings.discordWebhook`. That is user-provided, which is fine, but it lets users make the server POST to arbitrary URLs (a mild SSRF vector to consider).
- `settings.public.maintenanceMode` (`imports/constants/MAINTENANCE_MODE.js`).
- `CONTAINER_VERSION` env (`VERSION.js`).
- `settings.public.disallowCreatureApiImport` controls importing characters from another DiceCloud instance.
- Analytics: none found. A grep for analytics, gtag, googletagmanager, sentry, kadira and montiapm in app code returned nothing.

### Inferences
- Candidate F4, "De-hardcode": replace each URL with `Meteor.absoluteUrl('invite/' + token)` and `Meteor.absoluteUrl('favicon-96x96.png')`, and set `Accounts.emailTemplates.from` from `Meteor.settings.private.emailFrom` (or a `MAIL_FROM` env). Optionally set `siteName` to "Reverent Abyss". Effort: tiny, and low risk.
- Candidate F5, "Strip Patreon UI": hide Patreon links and buttons when `disablePatreon`. They currently show regardless in the Sidebar and Home pages, which is cosmetic but confusing for players.
- Candidate F6: keep `disallowCreatureApiImport: false` so players can pull their existing characters from dicecloud.com into the fork. This is a strong onboarding feature. Verify it still works against upstream's current API.
- The Discord webhook is acceptable for a private group. Optionally restrict to `https://discord.com/api/webhooks/` URLs.

### Gaps
- Did not check `public/` static assets or `client/*.html` head tags for upstream meta tags, favicon or manifest names (the grep was limited to js/ts/vue/html under imports/client/server).

## Email: MAIL_URL options and what breaks without it

### Takeaway
Without MAIL_URL, Meteor prints emails to stdout instead of sending them, so the app keeps working. Password reset, email verification and enrollment invites don't reach users, but an admin can copy the links from `docker logs`. For a 5–10 person group, that is an acceptable fallback. Oracle blocks outbound port 25, so use a provider on port 587/465: Brevo free (300/day), OCI Email Delivery (3,000/month free) or Mailgun.

### Cited Findings
- If neither MAIL_URL nor service settings are set, `Email.send` "outputs the message to standard output instead". The format is `smtp://USER:PASS@HOST:PORT` (STARTTLS, typically 587) or `smtps://` (implicit TLS, "most common on port 465"). The alternative is `settings.packages.email` with `service`/`user`/`password` (for example "Mailgun", Email ≥2.2), or `Email.customTransport` — [Meteor Email docs](https://docs.meteor.com/api/email.html)
- The app uses `Accounts.sendVerificationEmail` (`imports/api/users/methods/addEmail.js:29`, `Users.js:186`). Reset, verify and enroll templates are defined in `accountsEmailConfig.js`. The `email@2.2.6` package is present — local repo
- Oracle blocks outbound TCP 25 by default (an exemption needs a limits request). OCI Email Delivery gives 3,000 emails/month free — [Oracle Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm)
- Brevo's free plan reportedly allows 300 emails/day with SMTP relay, with Brevo branding on free plans (marketing emails). Figures vary by source — [WP Mail SMTP Brevo review](https://wpmailsmtp.com/brevo-review/), [SendLayer free SMTP comparison](https://sendlayer.com/blog/best-free-smtp-servers/)

### Inferences
- Candidate E1: OCI Email Delivery. Free, same provider, and SMTP on 587. It requires an approved sender and domain with SPF/DKIM. Risk: Oracle account issues take email down along with everything else.
- Candidate E2: Brevo free SMTP relay (`smtp-relay.brevo.com:587`, background knowledge). Simple and independent of Oracle. Verify that branding applies to transactional SMTP before relying on it.
- Candidate E3: no email. Disable verification prompts and handle resets manually (`Accounts.setPassword` via `meteor shell`, or copy the reset link from logs). This is the lowest effort.
- Whichever you choose, fix the `from` address (F4) and add SPF/DKIM DNS records for the sending domain, or messages will land in spam.
- The current compose placeholder `MAIL_URL=smtp://EMAIL:PASSWORD@SERVER:PORT` is an invalid host. It will produce send errors (possibly thrown into method calls like addEmail) rather than the harmless stdout fallback. Remove the variable entirely if you are not configuring mail. This is an inference; verify the behaviour.

### Gaps
- Did not verify Mailgun's current free-tier terms (they have changed repeatedly). Not researched in this session.
- Brevo figures come from third-party reviews, not Brevo's own pricing page.
