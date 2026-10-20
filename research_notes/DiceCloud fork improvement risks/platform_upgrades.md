# Platform Upgrades: Meteor, Node, MongoDB, Vue/Vuetify, Dependencies (as of 2026-10-20)

Local facts come from the repo at `C:\Users\User\DiceCloud-x-Reverent-Abyss\app` (develop branch, commit bd90199d). They are cited as [Local: file]. Grep counts are rough: they use fixed-string matching, so generic matches like `Array.prototype.find(` or a Vuex `.update(` are included.

### Current stack inventory (local)
- Meteor release `METEOR@2.16` [Local: app/.meteor/release]. Core packages: `mongo@1.16.10`, `npm-mongo@4.17.2` (MongoDB Node driver 4.17.2), `accounts-base@2.2.11`, `typescript@4.9.5`, `ecmascript@0.16.8` [Local: app/.meteor/versions].
- `package.json` sets `"engines": {"node": "14.0.x", "npm": "6.13.x"}`. The build script is `meteor build ../build --architecture os.linux.x86_64`, so it is x86_64 only today [Local: app/package.json].
- Frontend versions are pinned exactly: `"vue": "2.6.14"` (not 2.7), `"vuetify": "2.6.15"`, `vue-router ^3.6.5`, `vuex ^3.1.3`, `vuedraggable ^2.23.2`, `vue-meteor-tracker ^2.0.0`, `qrcode.vue ^1.7.0`, `@chenfengyuan/vue-countdown ^1.1.5`, `vuetify-upload-button ^2.0.2`. Vue is compiled through Atmosphere packages `akryum:vue-component@0.16.0`, `akryum:vue-router2@0.2.3` and `zer0th:meteor-vuetify-loader@0.1.41` [Local: app/package.json, app/.meteor/versions].
- Other notable npm dependencies: `discord.js ^12.5.3`, `request ^2.88.2` (deprecated), `bcrypt ^5.1.1`, `sharp ^0.33.2`, `simpl-schema ^1.13.1`, `@aws-sdk/client-s3 ^3.523.0`, `marked ^4.3.0`, `dompurify ^2.4.7`, `date-fns ^1.30.1` [Local: app/package.json].
- `package-lock.json` is lockfileVersion 1 (npm 6 era) [Local: app/package-lock.json].
- Local packages: `app/packages/accounts-patreon` and `app/packages/patreon-oauth` [Local: app/packages].
- Codebase size: 352 `.vue` files and about 452 `.js`/`.ts` files under imports/server/client [Local: find].

## Q1. Meteor 3 breaking changes and how much of this codebase they hit

### Takeaway
Meteor 3 removes Fibers and makes the server-side Mongo/method APIs async-only. The migration path runs through `*Async` variants (`findOneAsync`, `callAsync`, etc.). The codebase has only started this: about 30 `*Async` call sites against roughly 440 sync-style Mongo call lines. It also depends on at least 8 Fibers-era or abandoned Atmosphere packages, including the whole Vue 2 build chain (`akryum:vue-component`). In practice Meteor 3 also forces the Vue 3 migration. This is a large, multi-month effort, not a version bump.

### Cited Findings
- The official v3 migration guide lists `Meteor.call` → `Meteor.callAsync` as a breaking change. It points to a "Removing Fibers Patterns" guide and a "Migrating to Async in v2" guide, so the prep work can start while still on 2.x. The upgrade steps are `meteor update`, then `meteor reset`, then deleting `node_modules` and `package-lock.json` and running `meteor npm install` — [Meteor v3 migration docs](https://v3-migration-docs.meteor.com/)
- Meteor 3.x Node versions: 3.3 bundles Node 20, 3.4 bundles Node 22, and 3.5 bundles Node 24. The current version is v3.5.2 — [Meteor install docs](https://docs.meteor.com/about/install.html)
- In March 2026 Meteor staff said Meteor 3.4.0 ran on Node 22.22.0 and that Node 24 would land in 3.5, or in 3.6 at the latest — [Meteor forums: Node 24 thread](https://forums.meteor.com/t/when-is-meteorjs-planning-to-move-to-node-version-24-x/64476)
- Meteor 3.2 moved to Node 22.14.0 and MongoDB 7.0.16. Meteor 3.3.0 moved to Node 22.16.0 and Express 5.1.0 — [Meteor 3.2.0 changelog](https://v3-docs.meteor.com/generators/changelog/versions/3.2.0.html); [Meteor history](https://release-3-4-0.docs-online.meteor.com/history). The search summary for these two links conflicts with the install docs, which say 3.3 bundles Node 20. Treat the per-minor Node mapping as uncertain. What is certain is that 3.4+ uses Node 22 and 3.5 uses Node 24.
- `peerlibrary:reactive-publish` blocked some Meteor 3 migrations. The replacement is `nachocodoner:reactive-publish` 1.1.0 (announced 2025-12-20). It merges the functionality of `peerlibrary:subscription-data` and server-side `this.autorun`. It is async-aware (`findOneAsync`, `countAsync`, `await this.data(...)`) and passes Meteor core tests. One user reported "no changes other than the async/await makeover" — [Meteor forums: Reactive-Publish for Meteor 3](https://forums.meteor.com/t/reactive-publish-for-meteor-3-revived-and-ready-for-composite-data-publishing/63818)
- The peerlibrary package does not support async collection functions. One developer switched to `publish-composite` instead — [Meteor forums: reactive publish async](https://forums.meteor.com/t/reactive-publish-using-async-collection-functions/61470)
- `akryum:vue-component` did not satisfy Meteor 3's required top-level package versions. Akryum chose not to update it and moved the Vue integration onto Vite; `vue-meteor-tracker` 3.x was rewritten for Vue 3. No source confirms a supported Vue 2 + Meteor 3 build path — [Meteor forums: Meteor 3 update conflicts](https://forums.meteor.com/t/meteor-3-update-conflicting-instructions-and-conflict-errors/62263); [Status of Vue 3 + Meteor](https://forums.meteor.com/t/status-of-vue-3-meteor/57915); [meteor-vite on npm](https://npmjs.com/package/meteor-vite)

### Local codebase exposure (grep counts over imports/, server/, client/, packages/ in .js/.ts/.vue) [Local]
| Pattern | Lines | Files |
|---|---|---|
| `.findOne(` | 208 | 132 |
| `.find(` (includes Array.find) | 290 | 120 |
| `.update(` | 93 | 41 |
| `.insert(` | 30 | 24 |
| `.remove(` | 29 | 19 |
| `.fetch()` | 65 | 44 |
| `.count()` | 16 | 14 |
| `Meteor.user()` | 30 | 21 |
| `Meteor.users.findOne` | 26 | 21 |
| `Meteor.call(` | 3 | 2 |
| `Meteor.wrapAsync` | 4 | 3 |
| `Fiber` (direct `Npm.require('fibers')`) | 2 | 1 |
| `rawCollection` | 8 | 7 |
| Already async: `callAsync` 16, `findOneAsync` 19, `updateAsync` 4, `insertAsync` 5, `removeAsync` 6, `fetchAsync` 4 | about 54 | |
| `findOne/update/insert/remove/fetch/count` in .js/.ts | 309 | |
| same in .vue (client-side, can stay sync on the client in Meteor 3) | 130 | |
| same inside `*methods*` paths (isomorphic or server) | 106 | |
| `new ValidatedMethod` | 97 | |
| `Meteor.publish` | 30 | |
| Publications using `this.autorun` (peerlibrary reactive-publish) | 9 files | |
| `attachSchema` (collection2) | 22 | |
| `batchInsert` (mikowals:batch-insert) | 13 | |
| `FilesCollection` (ostrio:files) | 5 files | |
| `SyncedCron` | 3 files | |
| `Migrations.add` (percolate:migrations) | 3 | |

- Fibers and wrapAsync hotspots: `imports/server/rest/middleware/authenticateUserByToken.js` calls `Npm.require('fibers')` directly. `Meteor.wrapAsync` appears in `imports/api/creature/archive/methods/archiveCreatureToFile.js`, `imports/api/users/patreon/updatePatreonDetails.js` (2 uses) and `imports/migrations/server/dbv3/dbv3.ts` [Local].
- `zodern:fix-async-stubs` is already installed. That package exists to make async method stubs work on 2.x, which suggests the original author had started async preparation [Local: app/.meteor/packages].

### Atmosphere packages in use and Meteor 3 status
These come from app/.meteor/versions. The status column draws on the sources above plus background knowledge where marked. The report writer should treat entries marked "unverified" as needing a check against Atmosphere/Packosphere.
| Package (version) | Meteor 3 status |
|---|---|
| `akryum:vue-component@0.16.0`, `akryum:vue-router2@0.2.3`, `akryum:npm-check`, `akryum:vue-component-dev-*` | No Meteor 3 release; abandoned in favour of Vite (cited above). Hard blocker. |
| `zer0th:meteor-vuetify-loader@0.1.41` | Tied to the akryum Vue 2 build chain; no Meteor 3 version found (unverified). Blocker. |
| `peerlibrary:reactive-publish@0.10.0`, `peerlibrary:subscription-data@0.8.0`, and transitive `peerlibrary:fiber-utils`, `server-autorun`, `reactive-mongo`, `computed-field`, `data-lookup`, `extend-publish` | Fibers-based, no Meteor 3 release. Replace with `nachocodoner:reactive-publish` (cited above). |
| `mikowals:batch-insert@1.3.0` | Old and Fibers-era; no Meteor 3 release found (unverified). Likely replace with `rawCollection().insertMany`. |
| `bozhao:link-accounts@2.8.0` | Meteor 3 status not verified. |
| `simple:rest@1.2.1`, `simple:json-routes`, `simple:rest-method-mixin`, `simple:rest-bearer-token-parser`, `simple:rest-json-error-handler` | Old (2016-era) and connect/Fibers-based; no Meteor 3 release found (unverified). Meteor 3 moved to Express (cited above), so these would likely be rewritten as `WebApp` Express handlers. |
| `dburles:mongo-collection-instances@0.4.0`, `lai:collection-extensions` | Meteor 3 status not verified. |
| `aldeed:collection2@3.5.0`, `aldeed:schema-index` | The aldeed packages had Meteor 3-compatible 4.x releases, but this comes from background knowledge and could not be confirmed in this session. |
| `mdg:validated-method@1.3.0` | A Meteor 3 compatible release exists per background knowledge (unverified this session). |
| `ostrio:files@2.3.3` | Search did not confirm Meteor 3 status. Background knowledge says v3.x targets Meteor 3 (unverified). |
| `percolate:migrations@1.1.1`, `littledata:synced-cron@1.5.1` | Not verified. Both are commonly forked or updated for async; check Packosphere. |
| `seba:minifiers-autoprefixer@2.0.1`, `lmieulet:meteor-coverage@4.1.0`, `lmieulet:meteor-legacy-coverage`, `meteortesting:mocha@2.1.0` | Not verified; the testing and coverage packages are dev-only. |
| `zodern:types`, `zodern:fix-async-stubs` | fix-async-stubs is a 2.x-only shim and becomes unnecessary in 3.x. |
| Local `accounts-patreon`, `patreon-oauth` | Under your control, but must be ported (the OAuth flow plus `wrapAsync` in updatePatreonDetails). |

### Inferences
- About 440 sync Mongo call lines (309 in JS/TS) plus 97 ValidatedMethods and 30 publications must be reviewed. Server and isomorphic code must become async, and the async change spreads up the call chain through the engine/computation code that DiceCloud runs server-side. A rough estimate for one developer is 4-10 weeks of server-side async conversion plus testing, before any frontend work.
- Because `akryum:vue-component` has no Meteor 3 build, a Meteor 3 upgrade cannot be separated from a Vue 2 → Vue 3 (and Vuetify 2 → 3) migration plus a build tool change (Vite via `vite:bundler`). This bundling is the single biggest risk.
- A staged path reduces risk: (1) on 2.16, convert server code to `*Async` APIs, which 2.16 already supports; (2) replace peerlibrary with nachocodoner:reactive-publish where it supports 2.x (unverified); (3) only then swap to 3.x.

### Gaps
- A per-package Meteor 3 compatibility check (Packosphere or Atmosphere) was not done, so the "unverified" rows need confirming.
- It is unclear whether `nachocodoner:reactive-publish` also supports Meteor 2.16, which would allow staged migration.
- The grep counts do not separate client-only from server code, beyond the .vue split.

## Q2. Support and security status of Meteor 2.16 and its Node 14 (October 2026)

### Takeaway
Meteor 2.x reached end of life in December 2025 and Node 14 reached EOL in April 2023. Meteor's extra Node 14 security patching ran only from April 2023 to April 2024. In October 2026 the stack gets no security fixes at the framework or runtime level. The Node project itself issues placeholder CVEs that flag EOL lines.

### Cited Findings
- Meteor 2.x entered Maintenance Mode in July 2025 (critical security fixes only) and "will completely reach End-of-Life in December 2025". This was posted 2025-05-27 — [Meteor forums: Supported Versions Clarification](https://forums.meteor.com/t/meteor-supported-versions-clarification-transition-timeline/63646)
- Galaxy's docs describe Meteor 2.x as getting no more security patches and no more support. Galaxy says it will keep running apps of any version — [Galaxy supported versions](https://help.galaxycloud.app/docs/apps/meteor/supported-versions)
- Meteor provided 12 months of Node 14 extended security maintenance (April 2023 to April 2024), shipped as Node 14.21.4 starting in Meteor 2.13 — [Meteor blog: Extended Support Maintenance for Node.js 14](https://blog.meteor.com/announcing-extended-support-maintenance-for-node-js-14-f9e8381f8bb5); [Meteor guide: using node v14.21.4](https://guide.meteor.com/using-node-v14.21.4)
- A later Meteor forum post says the commitment period has expired and that security fixes had become non-portable to 14 — [Meteor forums ESM thread](https://forums.meteor.com/t/announcing-extended-support-maintenance-for-node-js-14/59811/11) (date of that reply not captured)
- Meteor 2.13.1 shipped Node 14.21.4 (bundle 14.21.4.1). The 2.14 release updated the MongoDB driver to 4.17.2. The 2.16.0 release (2024-05-14) added async observe methods — [Meteor changelog](https://docs.meteor.com/changelog); [v2 changelog](https://v2-docs.meteor.com/changelog)
- Node.js release schedule: v14 EOL 2023-04-30; v18 EOL 2025-04-30; v20 EOL 2026-04-30 (already EOL); v22 maintenance LTS until 2027-04-30; v24 entered maintenance LTS on 2026-10-20 and reaches EOL 2028-04-30 — [nodejs/Release schedule.json](https://raw.githubusercontent.com/nodejs/Release/main/schedule.json)
- The Node.js project issued CVE-2025-23089 as a placeholder flagging EOL Node versions (CWE-1104, unmaintained components) — [HeroDevs CVE-2025-23089](https://herodevs.com/vulnerability-directory/cve-2025-23089). A HeroDevs post, written by a vendor that sells extended support, says that in May 2025 the Node team extended the affected ranges of 97 existing CVEs to cover EOL lines Node 4-16 — [HeroDevs blog](https://www.herodevs.com/blog-posts/node-js-just-extended-the-range-of-97-cves-on-eol-versions-still-think-youre-safe)

### Inferences
- Node 20 is already EOL (April 2026), so it should not be a target. A realistic target is Node 22 (Meteor 3.4, supported to April 2027) or Node 24 (Meteor 3.5.x, supported to April 2028).
- On 2.16, any newly found Node 14 bugs (http parser, TLS, undici-less http) stay unfixed. Exposure depends on what sits in front of the app. A reverse proxy such as nginx or Caddy with TLS termination reduces, but does not remove, HTTP-layer risk.

### Gaps
- No authoritative list of specific post-EOL Node 14 CVEs was compiled; the nodejs.org security blog was not read directly.
- No Meteor-2.x-specific CVEs (DDP or accounts) were found in this research.

## Q3. ARM64 (Ampere A1) compatibility: Meteor 2.16 and MongoDB 6/7/8

### Takeaway
Meteor 2.x has never officially supported Linux ARM64, for either the dev tool or official builds. Linux ARM support arrived in Meteor 3.x. MongoDB 7.0 and 8.0 ship official arm64 builds for Ubuntu and RHEL, and require ARMv8.2-A, which Ampere A1 (Neoverse N1) should meet. Meteor 2.16's driver (4.17) fully supports MongoDB 7.0 and only partially supports 8.0.

### Cited Findings
- Meteor staff (nachocodoner, 2025-04-01): "we introduced ARM Mac-only support starting with Meteor 2.5.6", "Linux ARM support arrived in Meteor 3.x", and building Meteor 2 for ARM has been hard because "our internal pipelines no longer supported it after the shift to Meteor 3." — [Meteor forums: 2.16.1-beta.0 is intel only](https://forums.meteor.com/t/release-2-16-1-beta-0-is-intel-only-can-arm64-be-added/63405)
- The 2.8.2 npm installer rejected Linux arm64 — [Meteor forums: npm install 2.8.2 fails on ARM64](https://forums.meteor.com/t/npm-install-2-8-2-fails-on-arm64-asks-to-upgrade-to-2-5-1-or-later/59177). A community HOWTO covers Meteor 3.0 alpha on Linux arm64 (Dec 2023) — [Meteor forums HOWTO](https://forums.meteor.com/t/howto-using-newest-meteor-3-0-alpha-at-linux-arm64/60921)
- Meteor's install page lists OS X, Windows and Linux, 64-bit only, and does not explicitly mention Linux arm64 — [Meteor install docs](https://docs.meteor.com/about/install.html). This conflicts in emphasis with the forum statement that Linux ARM arrived in 3.x.
- MongoDB arm64 requires ARMv8.2-A or later (since 5.0). The 7.0 support matrix lists arm64 for RHEL/Rocky/Alma 8/9 and Ubuntu 20.04/22.04 — [MongoDB 7.0 production notes](https://www.mongodb.com/docs/v7.0/administration/production-notes/). Percona says the same ARMv8.2-A baseline covers Graviton2 and newer — [Percona system requirements](https://psmdb-docs-8-0-pr-1040.onrender.com/system-requirements.html)
- Node driver 4.8-4.17 (the 2.16 driver is 4.17.2) is listed as fully supporting MongoDB 7.0 and only partially supporting 8.0 ("not all new server features supported") — [MongoDB Node driver compatibility (v5.6 docs)](https://mongodb.com/docs/drivers/node/v5.6/compatibility). Older v4.2 docs showed 7.0 as partial, so the rating changed over time.
- Meteor staff's table (2025-07-15) for Meteor 2.10 to 3.0-beta.7 lists latest compatible MongoDB as 7.0, MongoDB with all features as 6.0, and oldest supported as 3.6. There is no MongoDB 8 column, and the question of Meteor 2.x on Mongo 8 went unanswered — [Meteor forums: MongoDB 6.0 EOL thread](https://forums.meteor.com/t/mongodb-6-0-end-of-life-on-july-31-2025-automatic-atlas-cluster-upgrades-to-8-0/63752)
- Meteor 2.11 embedded MongoDB 6.0.3 and Meteor 2.15 embedded 7.0.5 for development — [Meteor blog 2.11](https://blog.meteor.com/new-meteor-2-11-and-the-new-embedded-mongodb-19767076961b); [Meteor changelog](https://docs.meteor.com/changelog)
- MongoDB lifecycle: 6.0 EOL 2025-07-31 (past); 7.0 EOL 2027-08-31 (extended to four years in Sept 2025); 8.0 EOL 2029-10-31 — [MongoDB lifecycle schedule](https://mongodb.com/support-policy/lifecycles); [MongoDB: longer lifecycles for 7.0 and 8.0](https://www.mongodb.com/products/updates/longer-lifecycles-for-mongodb-7-0-and-8-0/)

### Inferences
- Running the production bundle (`meteor build` output plus `node main.js`) on ARM64 is a different problem from running the Meteor dev tool on ARM64. A server bundle is mostly plain JS that can run on an arm64 Node binary. Native npm modules (`bcrypt`, `sharp`) must be rebuilt or installed for linux-arm64, which `npm install` inside an arm64 container handles. Meteor's own native package dependencies would also need arm64 builds. The likely pattern is: build on x86_64 (CI), then `npm install --production` on an arm64 image with a Node 14 arm64 binary. Upstream Node 14.21.3 published linux-arm64 binaries (background knowledge), but Meteor's patched 14.21.4 may be x64-only (unverified). This route is unofficial and needs a test.
- Ampere Altra (A1) uses Neoverse N1 cores, which implement ARMv8.2-A, so MongoDB 7/8 arm64 builds should run. This comes from background knowledge and no source here names Ampere explicitly. Note also that MongoDB supports Oracle Linux only with RHCK; Ubuntu 22.04 arm64 is the safer image choice.
- On 2.16, MongoDB 7.0 is the recommended server version: it has full driver support and is supported until August 2027. MongoDB 8.0 probably works for basic CRUD and oplog use but is "partial" and unconfirmed for Meteor 2.x.

### Gaps
- No source confirms that a Meteor 2.16 server bundle has been run successfully on linux-arm64 with Node 14.
- It was not confirmed whether Meteor 3's official installer and dev bundle (`meteor` tool) ship linux-arm64 builds; only a forum statement supports this.
- Oplog tailing behaviour of driver 4.17 against MongoDB 8 was not verified.

## Q4. Vue 2 / Vuetify 2 EOL and the cost of moving to Vue 3

### Takeaway
Vue 2 reached EOL on 2023-12-31 and Vuetify 2 on 2025-01-23/25. The app pins Vue 2.6.14, which is not even the final 2.7 release, and Vuetify 2.6.15. Both carry open advisories (Vuetify high, Vue low) that are fixed only in Vue 3 or Vuetify 3+. The migration touches 352 `.vue` files: 121 of them use the `meteor: {}` reactive block and 42 use Vuetify-2-specific components with changed APIs. It also requires a new build pipeline.

### Cited Findings
- The official Vuetify 2 EOL page says it "officially reached End of Life (EOL) effective January 25th, 2025". HeroDevs and eosl.date say January 23, 2025. Paid extended support exists through HeroDevs NES — [Vuetify 2 EOL page](https://v2.vuetifyjs.com/en/about/eol/); [HeroDevs Vuetify NES](https://herodevs.com/support/vuetify-nes)
- Vue 2 EOL was 2023-12-31, with 2.7 as the last release — [endoflife.ai Vue 2](https://endoflife.ai/article-vue2-eol). This is a single non-official source here; the official Vue announcement was not retrieved, though the date is widely known.
- npm audit (below) flags `vuetify` 2.0.0-3.0.0-beta.15 as high, for prototype pollution (GHSA-3jp5-5f8r-q2wg) and XSS in VDatePicker (GHSA-9w3x-85mw-4fwm). The suggested fix is vuetify 4.3.0, a semver-major change. `vue` 2.x has a low-severity ReDoS in parseHTML (GHSA-5j4c-8p2g-v4jx), fixed only in vue 3.5.x — [Local: npm audit output]; [GHSA-3jp5-5f8r-q2wg](https://github.com/advisories/GHSA-3jp5-5f8r-q2wg); [GHSA-5j4c-8p2g-v4jx](https://github.com/advisories/GHSA-5j4c-8p2g-v4jx)

### Local migration surface [Local: grep]
- 352 `.vue` files in total.
- 121 `.vue` files contain a `meteor: {` block (the vue-meteor-tracker 2.x options API). These must move to vue-meteor-tracker 3's API or composables.
- 42 `.vue` files use Vuetify 2 components whose APIs changed in Vuetify 3 (`v-list-item-content`, `v-list-item-title`, `v-subheader`, `v-data-table`).
- 36 template lines look like Vue 2 filters (`{{ x | filter }}`), which Vue 3 removed (heuristic count).
- 25 lines use `Vue.use/component/extend/set/delete`, `new Vue` or `$set/$delete`, which are removed or changed globals.
- 3 lines use `slot-scope` or `.sync`.
- Vue 2-only dependencies need replacing: `vuedraggable@2` (Vue 3 needs vuedraggable@next), `qrcode.vue@1`, `@chenfengyuan/vue-countdown@1`, `vuetify-upload-button`, `vue-reactive-provide`, `@tozd/vue-observer-utils`, `vue-router@3` → 4, `vuex@3` → 4 or Pinia [Local: app/package.json].
- `@vue/compiler-dom` and `@vue/runtime-dom` ^3.4.19 are already devDependencies, but only for tooling and typing [Local: app/package.json].

### Inferences
- The Vue 3 + Vuetify 3 port is the largest single cost, likely bigger than the Meteor async work given 352 SFCs and heavy Vuetify use. A rough estimate for one developer is 2-4 months. An intermediate step is Vue 2.7 (backports Composition API, a drop-in from 2.6.14), but it is still EOL and it is unclear whether the akryum compiler supports 2.7 (unverified).
- Vuetify 4 is listed in npm audit's fix suggestion, so a fresh migration could target Vuetify 3.x LTS or 4.x. Vuetify's lifecycle for 3.x should be checked before choosing.

### Gaps
- Vuetify 3 and 4 support windows were not researched.
- It was not verified whether akryum:vue-component works with Vue 2.7.

## Q5. npm audit results (production dependencies)

### Takeaway
`npm audit --omit=dev --package-lock-only` (run on a copy of package.json and package-lock.json in the scratchpad; the repo was not modified) reports 40 vulnerabilities: 8 critical, 11 high, 13 moderate, 8 low, across 484 production dependencies. Several have no non-breaking fix: `request` is deprecated and unfixable, and `form-data`, `qs`, `tough-cookie` and `uuid` come in through `request`. Others need semver-major bumps: `bcrypt` 6, `sharp` 0.35, `vuetify` 4, `vue` 3.

### Cited Findings (all from [Local: npm audit --package-lock-only --omit=dev, npm 10.8.2, run 2026-10-20])
Critical:
- `request` (direct, all versions): SSRF (GHSA-p8p7-x288-28g6), plus vulnerable transitive form-data, qs, tough-cookie and uuid. **No fix available**, because the package is deprecated.
- `form-data` <=2.5.5 (via request): unsafe random boundary (GHSA-fjxv-7rqg-78g4) and CRLF injection. No fix through request.
- `fast-xml-parser` <=5.6.0 (via @aws-sdk/client-s3): DOCTYPE entity regex injection and entity expansion DoS (GHSA-m7jm-9gc2-mpf2). Fix: update the AWS SDK.
- `tar` <=7.5.20 (via bcrypt → @mapbox/node-pre-gyp): hardlink path traversal and DoS. Fix: bcrypt 6.0.0 (major).
- `elliptic`, `cipher-base`, `pbkdf2`, `sha.js` (crypto-browserify chain, most likely via `meteor-node-stubs` client polyfills): private key extraction and hash-rewind issues (GHSA-vjh7-7g9h-fjfh, GHSA-cpq7-6gpm-g9rc, GHSA-h7cp-r72f-jxh6, GHSA-95m3-7q98-8xr5). Fix available by updating.

High:
- `dompurify` (direct ^2.4.7, range <=3.4.15): prototype pollution, XSS and mXSS. This matters because the app renders user markdown with `marked`. Fix available.
- `lodash` (direct, <=4.17.23): code injection via `_.template` imports, and prototype pollution via `_.unset`/`_.omit`. Fix available. `lodash.template` command injection.
- `sharp` (direct ^0.33.2): inherited libvips/libheif CVEs (CVE-2026-33327, -33328, -35590, -35591). Fix: sharp 0.35.5 (major). Note that sharp 0.33+ ships prebuilt linux-arm64 binaries.
- `vuetify` (direct): prototype pollution and VDatePicker XSS. Fix only in a major version.
- `bcrypt` 5.0.1-5.1.1 and `@mapbox/node-pre-gyp`: via tar. Fix: bcrypt 6.0.0.
- `ws` 7.0.0-7.5.10 (likely via discord.js 12): DoS via many headers and memory exhaustion (GHSA-3h5v-q93c-6h6q). Fix available.
- `browserify-sign` (signature forgery), `brace-expansion`, `minimatch` (ReDoS).

Moderate/low: the `@aws-sdk/*` and `@smithy/*` chain (fixed by updating client-s3 beyond 3.722.0), `@babel/runtime` <7.26.10, `ajv`, `bn.js`, `qs`, `tough-cookie`, `uuid`, and `vue` (low ReDoS).

### Inferences
- Most of the high-impact server-side items can be fixed without a platform upgrade: replace `request` with native `fetch` or undici/axios (but Node 14 lacks global fetch), bump the AWS SDK, dompurify 3.x, lodash, ws via discord.js, and @babel/runtime. Some newer versions may not support Node 14. Recent AWS SDK v3 releases dropped Node 14 support (Node >=18 required, per background knowledge, unverified), and sharp 0.35 / bcrypt 6 likely require newer Node. **The security fixes that need major bumps are therefore partly blocked by staying on Node 14.**
- `discord.js` 12 is long unsupported. Discord API v8 deprecation could break it independently of security issues (unverified).

### Gaps
- The lockfile is v1. Dependency resolution may be slightly approximate, and an actual `node_modules` tree was not installed.
- Meteor's own bundled server dependencies (the dev bundle's node_modules) are not covered by this audit.
- It was not checked which fixed versions still support Node 14.

## Q6. Middle-ground options

### Takeaway
There are three realistic paths, in increasing cost.
- **(A) Stay on Meteor 2.16** on x86 (or attempt an unofficial arm64 bundle). Containerize, pair it with MongoDB 7.0, and patch npm dependencies where possible. This buys time but leaves an EOL runtime and framework.
- **(B) Do the async refactor on 2.16 first, then move to Meteor 3.4/3.5** while still on Vue 2. This is blocked by `akryum:vue-component` unless Vue 2 can be built another way.
- **(C) Full modernization**: Meteor 3.5 (Node 24) with Vite, Vue 3 and Vuetify 3/4, and MongoDB 8.0. This has native Linux ARM64 support and the longest support windows (Node 24 to 2028-04, MongoDB 8 to 2029-10).

### Cited Findings
- Meteor 2.15 and later embed MongoDB 7.0.5 for dev, and driver 4.17 fully supports MongoDB 7.0, so "Meteor 2.16 + external MongoDB 7.0" is a supported-by-compatibility combination — [Meteor changelog](https://docs.meteor.com/changelog); [MongoDB driver compatibility](https://mongodb.com/docs/drivers/node/v5.6/compatibility)
- MongoDB 7.0 is supported until 2027-08-31 — [MongoDB lifecycle](https://mongodb.com/support-policy/lifecycles)
- Meteor provides migration guides for doing async work on v2 ("Migrating to Async in v2"), and 2.16 added async observe methods — [Meteor v3 migration docs](https://v3-migration-docs.meteor.com/); [v2 changelog](https://v2-docs.meteor.com/changelog)
- Meteor staff suggested no Linux ARM workaround for 2.x, only Rosetta on Mac — [Meteor forums 63405](https://forums.meteor.com/t/release-2-16-1-beta-0-is-intel-only-can-arm64-be-added/63405)
- HeroDevs sells commercial "Never-Ending Support" for Vuetify 2 (and Vue 2), which would let the frontend stay on Vue 2 with patched builds — [HeroDevs Vuetify NES](https://herodevs.com/support/vuetify-nes)

### Inferences
- **Option A on Oracle A1 ARM:** The most practical route is a multi-stage Docker build. Run `meteor build --server-only --architecture os.linux.x86_64` on an x86 CI runner, then copy the bundle into an `arm64v8` image with Node 14.21.x arm64 (upstream 14.21.3, since Meteor's 14.21.4 patch builds may lack arm64). Run `npm install --production` in `programs/server` so bcrypt and sharp compile or download arm64 binaries. This is untested and unsupported. An alternative is to run x86 under QEMU emulation (slow) or use an AMD Always Free micro instance (only 1 GB RAM, too small). There is also a cheaper sub-option: replace `bcrypt` with `@node-rs/bcrypt` or bcryptjs to avoid native builds (Meteor accounts-password 2.x uses bcrypt via npm; the fallback behaviour was not verified).
- **Option A security:** Fix `request`, dompurify, lodash, the AWS SDK and ws within Node 14 constraints. Put nginx or Caddy in front, and run MongoDB 7.0 bound to localhost with auth. Accept that Node 14 and Meteor 2 are unpatched.
- **Option B/C sequencing to limit risk:** (1) Do the async API conversion on 2.16, which is shippable incrementally. (2) Replace peerlibrary, simple:rest, batch-insert and the fibers middleware. (3) Port the frontend to Vue 3 + Vuetify 3 under Vite. (4) Bump to Meteor 3.4 (Node 22, until 2027-04) or 3.5 (Node 24, until 2028-04). Node 20 should be skipped, since it went EOL in 2026-04.
- **MongoDB choice:** 7.0 now (works with both 2.16 and 3.x, EOL 2027-08), then 8.0 after reaching Meteor 3.x, where the driver supports it fully.

### Gaps
- No real-world reports were found of Meteor 2.16 bundles running on Oracle A1 or another arm64 Linux host.
- Packosphere was not checked for whether the specific Atmosphere packages have 2.x/3.x dual-compatible releases that would allow staged swaps.
- No effort data (person-weeks) from comparable Meteor 2 → 3 + Vue 2 → 3 migrations was found; the estimates above are inferences only.
