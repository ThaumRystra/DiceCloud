# Upstream DiceCloud (ThaumRystra/DiceCloud): PRs, issues, branches and commits the Reverent Abyss fork lacks

Research date: 2026-10-20. Method: `git fetch upstream` (the remote already existed; nothing pushed), read-only fetches of PR heads into `refs/remotes/upstream-pr/*` (local refs only), the GitHub REST API (unauthenticated, until the 60/hr limit ran out), and GitHub web pages. Local fork: `develop` @ `bd90199d`, 2,702 commits.

Source shorthand:
- [LOCAL-GIT] means `git log`/`git diff` output in C:\Users\User\DiceCloud-x-Reverent-Abyss against `upstream/*` fetched 2026-10-20.
- [API-PULLS] = https://api.github.com/repos/ThaumRystra/DiceCloud/pulls?state=open
- [API-CLOSED] = https://api.github.com/repos/ThaumRystra/DiceCloud/pulls?state=closed
- [API-REPO] = https://api.github.com/repos/ThaumRystra/DiceCloud

## What has upstream changed since the fork point?

### Takeaway
The fork already contains every commit on upstream `develop` (the default branch). The merge base is `88fc9c83` (PR #397, 2026-01-23), and `develop..upstream/develop` holds 0 commits. All newer upstream work sits on unmerged branches, mainly `DC-16-migrate-to-meteor-3` (20 commits, Apr 9 to May 10, 2026, 670 files changed). That branch rewrites the stack and edits 12 of the fork's modified files.

### Cited Findings
- `upstream/develop` is the default branch. Repo stats: 512 stars, 135 forks, not archived, 45 open issues plus PRs, last push 2026-05-10T18:29:43Z — [API-REPO](https://api.github.com/repos/ThaumRystra/DiceCloud)
- Merge base of fork `develop` and `upstream/develop` = `88fc9c83`, 2026-01-23 ("Merge pull request #397 from StormDragon894/patch-1"). `git rev-list develop..upstream/develop` = 0, so the fork is fully up to date with upstream develop — [LOCAL-GIT]
- The last develop commits before the fork point were already pulled in. They include the 2025 bug fixes "Fixed various action calling issues" (899dcf42, 2025-07-25), "Fix inline calculations reducing instead of compiling", "Fix bug in dependency loop detection", "fix bug duplicating library nodes" and "Fixed library nodes not having a default schema" — [LOCAL-GIT](https://github.com/ThaumRystra/DiceCloud/commits/develop)
- The fork's own diff vs upstream/develop is 32 files, +1151/−224 (2d10 core, RA ability table, numeric advantage, double-count fix) — [LOCAL-GIT]; RA_FORK_CHANGES.md

Upstream branches (ahead/behind measured against fork `develop`) — [LOCAL-GIT](https://github.com/ThaumRystra/DiceCloud/branches):

| Branch | Ahead of fork | Behind fork | Last commit | Status |
|---|---|---|---|---|
| `DC-16-migrate-to-meteor-3` | 20 | 13 (the RA commits) | 2026-05-10 "Removed some circular imports, more types" | Active WIP. Unmerged, ~5 months idle |
| `DC-6-creatures-summoned-from-libraries-have-no-properties` | 1 | 13 | 2026-04-07 "Began testing" | WIP bug fix. 7 files, +70/−12 |
| `zod-schemas` | 3 | 44 | 2025-01-01 | Stale experiment. Based on 2024-12-01 develop |
| `version-1` | 9 | 1905 | 2024-09-03 | v1 maintenance line. Irrelevant to the v2 fork |
| `feature-react-three` | 1 | 206 | 2024-02-27 | Stale (>2 yrs). 3D dice experiment |
| `vite` | 1 | 520 | 2023-03-02 | Stale/abandoned (>2 yrs). Earlier Vue 3 + Vite attempt |
| `master` | 0 | 352 | 2023-09-13 | Legacy. The fork already contains it |

DC-16 (Meteor 3) branch details — [LOCAL-GIT](https://github.com/ThaumRystra/DiceCloud/tree/DC-16-migrate-to-meteor-3):
- First commit `0d4a9501` (2026-04-09) is titled "Machine translation to Meteor 3, vue 3 composition, vuetify 3". It touches 496 files (+36,488/−29,207), and 351 of them are `.vue` files. The follow-ups fix rspack build errors, broken subscriptions and a character-loading crash, then add types and ESLint fixes and remove circular dependencies and the "parser god object".
- `.meteor/release` goes from `METEOR@2.16` (fork) to `METEOR@3.4.1-rc.0`. The build moves to rspack (`app/rspack.config.ts`, `@meteorjs/rspack`, `@rspack/core`, `@swc/core`).
- `package.json` engines go from node 14.0.x/npm 6.13.x to node 22.x/npm 10.x. Vue goes from 2.6.14 to ^3.5, Vuetify from 2.6.15 to ^3.12.5, vue-router from 3 to 4 and vuex from 3 to 4. vuedraggable is replaced by vue-draggable-plus, discord.js goes from 12 to 14, date-fns from 1 to 4 and eslint from 7 to 10. `request` is removed and `mongodb ^4.17.2` is added.
- `docker-compose.yml`: `mongo:latest` is pinned to `mongo:7`, and MONGO_URL gains `/dicecloud?authSource=admin`. The Dockerfile is also changed.
- Directories touched: client/ui 375 files, api/engine 70, api/creature 53, server/publications 22, parser/parseTree 15, api/tabletop 13, api/library 13, api/users 10.
- The engine becomes async. In DC-16, `rollAttack` is awaited, scope access is `await getEffectiveActionScope(...)`, and advantage is still the tri-state `0 | 1 | -1` from `await userInput.advantage(...)`. `aggregateEffect.js` and `computeImplicitVariable.js` are converted to `.ts`.

DC-6 branch: edits `addCreaturesFromLibraryToTabletop.ts` (+test), `CreatureVariables.ts` and `computeCreatureComputation.test.ts`. It fixes creatures summoned from libraries arriving with no properties. None of these files overlap with the fork — [LOCAL-GIT](https://github.com/ThaumRystra/DiceCloud/tree/DC-6-creatures-summoned-from-libraries-have-no-properties)

### Inferences
- Nothing on upstream `develop` needs pulling right now. The only upstream "improvements" are unmerged branches and community PRs.
- Branch names like "DC-16" and "DC-6" suggest the maintainer now tracks work in an external tracker (DC-n keys), not GitHub issues. That tracker is not public.
- The DC-16 branch has had no commits since 2026-05-10 (~5 months), and its first commit calls itself a machine translation. It is mid-flight, not release-ready. Pulling it now would mean adopting an unfinished rewrite.
- DC-6 is small and isolated. It is a low-risk cherry-pick once finished, or it can be cherry-picked now if the tabletop library-summon bug matters to the fork.

### Gaps
- Commit dates on DC-16 show no activity after 2026-05-10, but I could not confirm whether the maintainer is working on it in a private branch.
- I did not check whether DC-16 builds or passes tests.

## What open/merged PRs exist, and which are stale or abandoned?

### Takeaway
There are 13 open PRs, all from the community. The maintainer has not merged or reviewed most of them, and the only merge since Nov 2024 is #397, a 1-line invite-link fix. The useful candidates are two typo fixes (#401, #403), a `minValue()` dice function (#400), Docker modernisation (#389, #394), i18n (#395, superseding #388), auto-archiving (#390) and the library desync fix (#387). Most PRs over a year old are stale.

### Cited Findings
Open PRs (size from API or local `git diff --shortstat`, areas = files touched) — [API-PULLS](https://api.github.com/repos/ThaumRystra/DiceCloud/pulls?state=open):

| PR | Opened / last update | Title | Size | Areas touched | Status |
|---|---|---|---|---|---|
| [#403](https://github.com/ThaumRystra/DiceCloud/pull/403) | 2026-10-08 / 10-17 | Fix typo in toggle helpText (fixes issue #402 "Togggles") | +1/−1, 1 file | `constants/PROPERTIES.js` | Open, mergeable, fresh |
| [#401](https://github.com/ThaumRystra/DiceCloud/pull/401) | 2026-03-19 | Typo in applying disadvantage to passive skill value (`bassiveBonus` → `passiveBonus`) | +1/−1, 1 file | `computeVariableAsSkill.js` | Open, mergeable. **Overlaps a fork-modified file** |
| [#400](https://github.com/ThaumRystra/DiceCloud/pull/400) | 2026-03-19 | Implement minValue function for dice rolls | +27/−0, 1 file | `parser/functions.ts` | Open, mergeable |
| [#395](https://github.com/ThaumRystra/DiceCloud/pull/395) | 2025-12-27 / 2026-01-08 | Add internationalization (i18n) support (pt-BR, ~90% of UI) | +12,165/−7,321, 131 files, 10 commits | Vue UI components, `api/users/Users.js`, locales | Open, mergeable, CLA signed, no maintainer comment |
| [#394](https://github.com/ThaumRystra/DiceCloud/pull/394) | 2025-09-28 | refacto(docker): Download Node.js binaries directly (Debian 12 base, copies ./app rather than re-cloning, works for forks) | +28/−12, 1 file | `Dockerfile` | Open, mergeable |
| [#390](https://github.com/ThaumRystra/DiceCloud/pull/390) | 2025-03-28 / 2025-04-28 | Add Auto Archiving of Creatures (server cron every 10 min, `archiveAfterDays` setting, uses `lastComputedAt`) | +259/−30, 17 files, 15 commits | `api/creature/archive/*`, `Creatures.ts`, `updateFileStorageUsed.js`, ArchiveDialog, CreatureFolderList | Open, mergeable |
| [#389](https://github.com/ThaumRystra/DiceCloud/pull/389) | 2025-03-16 / 2025-09-29 | Update Dockerfile to a functional multistage build | +1,731/−1,653, 6 files (mostly package-lock) | `Dockerfile`, `docker-compose.yml`, `sample.env`, `package.json` | Open, mergeable |
| [#388](https://github.com/ThaumRystra/DiceCloud/pull/388) | 2025-02-22 | Adds support for internationalization (older) | +6,973/−1,540, 236 files | `.meteor/packages`, UI, LibraryNodes.js | Open, **not mergeable**. #395 supersedes it |
| [#387](https://github.com/ThaumRystra/DiceCloud/pull/387) | 2025-02-20 | Fix Issue #385: Client desync when creating an action in a library | +107/−19, 2 files | `api/library/LibraryNodes.js`, `client/serviceWorker.js` | Open, **not mergeable**. Upstream develop has since added "Fixed library nodes not having a default schema" (d42d2a72), which may already cover it |
| [#381](https://github.com/ThaumRystra/DiceCloud/pull/381) | 2024-11-06 / 2025-03-25 | Fix meteor install link (also adds Nix flake, justfile, Dockerfile rework, `.DS_Store`) | +1,879/−1,683, 12 files, 12 commits | Dockerfile, docker-compose, README, package files, flake.nix | Open, mergeable. Noisy, possibly stale |
| [#353](https://github.com/ThaumRystra/DiceCloud/pull/353) | 2024-06-19 / 2024-10-28 | dddice integration POC 1 (3D dice) | +162/−5, 8 files | `getReplayChoicesInputProvider.ts`, `doAction.ts`, `ActionDialog.vue`, new `diceProviders/dddice.ts` | Stale (base 2024-06). **Touches the dice/input-provider pipeline** |
| [#347](https://github.com/ThaumRystra/DiceCloud/pull/347) | 2024-02-16 / 2024-11-08 | Refactors sendWebhook.js to not mandate Discord webhook URLs | +79/−13, 2 files | `server/discord/sendWebhook.js` (+test) | Stale (opened >2 yrs ago). Small, isolated |
| [#333](https://github.com/ThaumRystra/DiceCloud/pull/333) | 2023-09-03 / 2024-11-05 | Add an option for flat reductions to damage multipliers | +86/−9, 10 files | Old `engine/actions/applyPropertyByType/applyDamage.js` path (the code has since moved), damage multiplier aggregation and UI | **Stale (>2 yrs)**. Targets a pre-refactor engine layout, so it would need a rewrite |

Recently closed or merged PRs — [API-CLOSED](https://api.github.com/repos/ThaumRystra/DiceCloud/pulls?state=closed):
- #397 (merged 2026-01-23) "Update invite link to use the new domain". It is already in the fork.
- #399 (closed unmerged 2026-03-05) "Add multi-system extensibility: gameSystem field, architecture docs, and vibe-hack libraries" by dms-killa. It added an optional `gameSystem` field on creatures and libraries, data-driven tabs, StatsTab hiding D&D sections, and CoC 7e/Expanse library scripts. The CLA check reported 0 of 2 committers signed, there was no maintainer comment, and the author closed it — [PR #399](https://github.com/ThaumRystra/DiceCloud/pull/399)
- #396 (closed unmerged) "Add empty state UI to character list". It relates to the open high-priority issue #361 — [API-CLOSED](https://api.github.com/repos/ThaumRystra/DiceCloud/pulls?state=closed)
- #391 (closed unmerged, 2025-04) InviteDialog URL fix, superseded by #397. #386 Feature i18n (closed). The last other merges were in the 2024-11-05 batch (#346, #334, #301).
- The 2023 piepie62 PRs #344 "Add discarded roll variable for (dis)advantage", #343 and #342 "Add ~ammo" were closed unmerged. #344 is relevant to the fork's advantage work as prior art — [API-CLOSED](https://api.github.com/repos/ThaumRystra/DiceCloud/pulls?state=closed)
- On #395, a commenter (danfmsouza) wrote "What I really wanted was to migrate to Vue 3" but found it too large. No ThaumRystra comment appears on #395 — [PR #395](https://github.com/ThaumRystra/DiceCloud/pull/395)

### Inferences
- Maintainer review bandwidth for community PRs is low. Most open PRs have no maintainer response, so the fork cannot count on PRs landing upstream first and has to cherry-pick from PR heads itself.
- Every UI-heavy PR (#395, #388, #390) is built on Vue 2/Vuetify 2. They will conflict heavily with DC-16 if upstream ever merges it, and their value depends on whether the fork stays on Meteor 2.
- #394 or #389 likely give the quickest self-hosting win. The fork's current Dockerfile installs Node 14 via the deprecated NodeSource `setup_14.x` script on `ubuntu:jammy` [LOCAL-GIT Dockerfile], which matches the deprecation that #394 says it bypasses.
- The fork's own `gameSystem`-style needs (a non-5e system) echo #399. Its docs could be mined for UI injection points, but it is not merge material, given the closed status, no CLA and 5e-specific assumptions.

### Gaps
- The API rate limit (60/hr unauthenticated) ran out before I could pull per-PR review and comment threads for #389, #390, #394 and #400.
- I did not check whether #387's fix is already covered by upstream commit d42d2a72.

## What notable open issues exist for self-hosters?

### Takeaway
There are 32 open issues. The self-hosting ones are #398 (poor install docs: Meteor/Mongo failures, RAM needs, empty instance with no libraries, settings format mismatch), #384 (publish a container image) and #282 (Docker doesn't build, 2021, stale). The maintainer has not responded on any of them. There are no open issues on S3/file storage, email, ROOT_URL or Patreon gating. The invite-link domain was fixed in #397.

### Cited Findings
- 32 open issues total. Page 1 lists #402 down to #267, and page 2 lists #233, #205, #201, #197, #158, #149 and #82, all of them old feature requests from 2017–2020 — [Issues p1](https://github.com/ThaumRystra/DiceCloud/issues?q=is%3Aissue+is%3Aopen); [Issues p2](https://github.com/ThaumRystra/DiceCloud/issues?page=2&q=is%3Aissue+is%3Aopen)
- #398 "Better Installation Documentation" (2026-01-24, follow-up 2026-08-17): Meteor install needed 2 GB RAM and 2 cores, and `meteor run --settings exampleMeteorSettings.json` struggled until 8 GB RAM. MongoDB failed to start even after installing MongoDB 8.x manually. The docs never mention installing Node. The example settings produce an empty instance with no content, and the `exampleMeteorSettings.json` format differs from the README (the README format caused lint errors). There is no maintainer reply — [Issue #398](https://github.com/ThaumRystra/DiceCloud/issues/398)
- #384 "Suggestion: Publish container image" (2025-01-11): the reporter proposes Docker Hub or GHCR and offers a PR, a user +1'd on 2026-01-01, and there is no maintainer response — [Issue #384](https://github.com/ThaumRystra/DiceCloud/issues/384)
- #282 "Docker dont build" (2021-08-27, labels bug and help wanted) is still open — [Issues p1](https://github.com/ThaumRystra/DiceCloud/issues?q=is%3Aissue+is%3Aopen)
- #366 "Test 2.1 Migrations" (2024-10-27, maintainer-authored) is open. This matters to self-hosters running data migrations — [Issues p1](https://github.com/ThaumRystra/DiceCloud/issues?q=is%3Aissue+is%3Aopen)
- Engine and library bugs: #385 Client desync when creating an action in a library (2025-01-27, bug, maintainer-authored, PR #387 pending) and #359 Attunement lingers after disabling the attunement requirement (2024-08-19, bug). Feature request #361 "Add empty state UI to character list" is labelled high priority — [Issues p1](https://github.com/ThaumRystra/DiceCloud/issues?q=is%3Aissue+is%3Aopen)
- Other feature requests: #351 i18n (PRs #388/#395), #345 Duplicate a character, #393 Add log for custom changes, #364 Build a "do check" dialog, and #326 "Change uninitialized behavior to not show an error" (labels action engine and calculation engine) — [Issues p1](https://github.com/ThaumRystra/DiceCloud/issues?q=is%3Aissue+is%3Aopen)
- Closed historical self-hosting issues: #311 Self Hosting DiceCloud (2023), #211 Improve local hosting docs (2019), #99 Export/Import for DiceCloud instances (closed 2023-06-07, low priority), #98 Unable to reverse-proxy (2017), #262 dicecloud.com email misconfigured (2021) and #279 Trouble adding the SRD library (2021) — [Issue search](https://github.com/ThaumRystra/DiceCloud/issues?q=is%3Aissue+docker+OR+self-host+OR+email+OR+ROOT_URL+OR+invite)
- Patreon gating is turned off via `"disablePatreon": true` in public METEOR_SETTINGS, which the README documents and the docker-compose in both develop and DC-16 sets by default — README.md lines 83–86 [LOCAL-GIT]; [docker-compose on DC-16](https://github.com/ThaumRystra/DiceCloud/blob/DC-16-migrate-to-meteor-3/docker-compose.yml)

### Inferences
- The "empty instance" complaint in #398 (no SRD or base libraries) and the closed #99 (no instance-to-instance export/import) together suggest a self-hosted fork must build its own library seeding or import path. Upstream offers nothing here.
- The fork's docker-compose uses `mongo:latest` (inherited from develop). DC-16's pin to `mongo:7` plus `authSource=admin` is a small, independent fix worth adopting on its own. With `latest` now resolving to Mongo 8, the Meteor 2.16 driver could break on a fresh pull, which may explain the #398 Mongo failures. This is speculative and unverified.

### Gaps
- I found no open issues on S3/file storage, MAIL_URL, ROOT_URL or invite links for self-hosters. Either none exist or they are filed elsewhere (Discord).
- I did not read the comments on #282 or #366.

## Is there an upstream roadmap or maintainer statement on Meteor 3 or a v3 rewrite?

### Takeaway
I found no public roadmap or maintainer statement. The only evidence is the code itself. The `DC-16-migrate-to-meteor-3` branch (Apr–May 2026) is a Meteor 3.4 + Vue 3 + Vuetify 3 + rspack migration. Earlier attempts (the `vite` branch in 2023, `zod-schemas` in 2025) were abandoned.

### Cited Findings
- The DC-16 commit history above, with the first commit "Machine translation to Meteor 3, vue 3 composition, vuetify 3" (2026-04-09) and the last commit on 2026-05-10 — [LOCAL-GIT](https://github.com/ThaumRystra/DiceCloud/commits/DC-16-migrate-to-meteor-3)
- The `vite` branch ("began the process of migrating to vue3 + vite", 2023-03-02) is the earlier, abandoned attempt — [LOCAL-GIT](https://github.com/ThaumRystra/DiceCloud/tree/vite)
- Web searches turned up no DiceCloud-specific Meteor 3 announcement, only general Meteor migration docs. The newest Patreon posts found are from 2021–2022: the v2 open beta and the "Version 2 Release Date - 2022-12-02" post, which names Discord as the main update channel — [Meteor 3 migration guide](https://v3-migration-docs.meteor.com/); [Patreon v2 release](https://www.patreon.com/dicecloud/posts/version-2-date-75207996); [Patreon v2 beta](https://www.patreon.com/posts/53405139)
- The README has no roadmap section. It documents only Meteor-based local running and Patreon/`disablePatreon` settings — README.md [LOCAL-GIT]

### Inferences
- Meteor 2.16 needs Node 14, which is EOL, so upstream will eventually force a choice. Expect any upstream merge after DC-16 lands to be effectively a re-port of the fork onto a new codebase rather than a merge.

### Gaps
- I could not access the Discord announcements (login-walled) or recent Patreon posts. There is no reliable source on target dates or whether a "v3" product rewrite is planned beyond the framework migration.

## Which upstream changes would conflict with the fork's own changes?

### Takeaway
DC-16 is the major conflict risk. It edits 12 of the fork's ~24 modified upstream files, and its async/typed engine rewrite reshapes exactly the RA hotspots: `rollAttack`, the save roll, the check task, the advantage tri-state, and the Vue 2 advantage inputs. Among the open PRs, only #401 (same file as the fork's skill advantage changes, 1 line) and #353 (dice input provider pipeline, stale) touch fork-sensitive code. DC-6, the Docker PRs, #400, #403 and #347 are conflict-free.

### Cited Findings
- Files changed by both DC-16 and the fork: `applyActionProperty.ts` (DC-16 +62/−40), `applySavingThrowProperty.ts`, `InputProvider.ts`, `inputProviderForTests.testFn.ts`, `applyCheckTask.ts` (+20/−14, imports become `type` imports, `getFromScope` moves to `../../shared/scope`), `computeVariableAsAttribute.js` (1 line), `computeVariableAsSkill.js`, `Attributes.ts`, `AdvantageInput.vue` (+20/−25, Vue 3 rewrite), `CheckInput.vue`, `EffectForm.vue` and `SpellForm.vue` — [LOCAL-GIT](https://github.com/ThaumRystra/DiceCloud/compare/develop...DC-16-migrate-to-meteor-3)
- DC-16 also renames `aggregateEffect.js` → `.ts` and `computeImplicitVariable.js` → `.ts`, both files the fork edits for numeric advantage. A rename plus modify gives a higher conflict likelihood — [LOCAL-GIT]
- In DC-16, `applyActionProperty.ts` still computes `const advantage: 0 | 1 | -1 = await userInput.advantage(...)` from boolean `attack.advantage`/`disadvantage`, and initialises `'~criticalHit': { value: false }`. This is the code the fork replaced with numeric advantage and `rollCoreDice` — [LOCAL-GIT](https://github.com/ThaumRystra/DiceCloud/blob/DC-16-migrate-to-meteor-3/app/imports/api/engine/action/applyProperties/applyActionProperty.ts)
- RA_FORK_CHANGES.md lists `rollAttack`/`applyCrits`, the save roll block, `applyCheckTask.ts`, the modifier line, the advantage lines and the two Vue inputs as hotspots, and says to search upstream diffs for `diceSize: 20` — RA_FORK_CHANGES.md [LOCAL-GIT]
- DICE_INVESTIGATION.md notes that `reroll()`/`explode()` in `parser/functions.ts` bypass the deterministic InputProvider. PR #400 adds `minValue()` to the same `parser/functions.ts` — DICE_INVESTIGATION.md [LOCAL-GIT]; [PR #400](https://github.com/ThaumRystra/DiceCloud/pull/400)
- PR #401 changes the disadvantage passive-bonus typo in `computeVariableAsSkill.js`. The fork removed the 5e passive ±5 advantage bonus in that same file — [PR #401](https://github.com/ThaumRystra/DiceCloud/pull/401); RA_FORK_CHANGES.md
- PR #353 (dddice) modifies `getReplayChoicesInputProvider.ts`, `doAction.ts` and `ActionDialog.vue`. These are the roll/replay pipeline DICE_INVESTIGATION.md maps — [LOCAL-GIT upstream-pr/353]
- PR #333 edits `aggregateDamageMultiplier.js` and `computeImplicitVariable.js` (fork-modified), but at old paths — [LOCAL-GIT upstream-pr/333]

### Inferences
Risk profile per candidate (my judgement from the file overlap above):

| Candidate | Value to fork | Conflict risk | Notes |
|---|---|---|---|
| PR #403 typo | Low | None | Trivial cherry-pick |
| PR #401 typo | Low | Low (1 line, but in a file the fork edits) | Probably moot, because the fork deleted the passive advantage bonus block. Check before applying |
| PR #400 `minValue()` | Medium (homebrew dice) | Low | Check whether it uses the deterministic InputProvider or `parser/rollDice.ts` (the non-deterministic path DICE_INVESTIGATION.md flags) |
| PR #394 / #389 Docker | High for self-hosting | None with RA code | #394 is +28/−12, 1 file. #389 rewrites package-lock, so regenerate it rather than merge |
| DC-16 `mongo:7` + `authSource` compose change | Medium | None | Hand-port 2 lines |
| DC-6 library summon fix | Medium | None | WIP. 7 files, no overlap |
| PR #390 auto-archive | Low–Medium | Low | Server cron plus Vue 2 UI |
| PR #395 i18n | Low–Medium | Medium (131 files of UI, may touch the fork's Vue inputs and forms) | Vue 2-based. Conflicts with DC-16 |
| PR #387 library desync | Medium | Low (not mergeable vs develop) | May be superseded by d42d2a72 |
| PR #347 webhooks | Low | None | Stale but isolated |
| PR #353 dddice | Low | Medium–High (dice pipeline) | Stale. Would need to understand 2d10 kept dice |
| PR #333 flat damage reduction | Low–Medium | Medium (old engine paths) | Stale, rewrite required |
| DC-16 Meteor 3 / Vue 3 | High long-term (Node 14 EOL) | **Very high**: 12 shared files, async engine, `.js`→`.ts` renames, all Vue rewritten, still tri-state advantage | Unfinished, idle since May 2026. Treat as a re-port, not a merge |
| `zod-schemas`, `vite`, `feature-react-three`, `version-1` | None | n/a | Stale or abandoned. Ignore |

- The fork's "keep all RA logic in new files" strategy (RA_DICE.ts, RA_ABILITY.ts, rollCoreDice.ts, AdvantageStepper.vue) will survive DC-16 best. The roller, though, has to become `async` and use DC-16's types and import paths, and AdvantageStepper.vue needs a Vue 3/Vuetify 3 port.

### Gaps
- I did not run a trial merge (`git merge-tree`) of DC-16 into the fork to count actual conflict hunks. Doing so would sharpen the DC-16 risk estimate.
- I did not inspect the code of PR #400 to confirm which RNG path it uses.
