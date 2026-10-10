# DiceCloud v2: 2d10 Feasibility Investigation

Scope: read-only investigation of this repo (`develop` @ `88fc9c83`). No source files were modified. All paths below are relative to `app/`.

**TL;DR:** The d20 is **not** data-driven for attacks, saving throws, or ability/skill checks. All three hardcode `diceSize: 20` and a "roll 2, keep 1" advantage in engine code. Only the generic **Roll** property (and damage) takes its dice from data. A pure library can only work around this by building every check out of Roll + Branch properties and never using the built-in attack/save/check mechanics. A small fork is the realistic path. About five engine spots need to read one dice config.

---

## 1. Roll pipeline

### 1.1 Flow (property → stored/displayed result)

| Stage | Where | Notes |
|---|---|---|
| Parse | `imports/parser/grammar.ne` (compiled to `grammar.js`), `imports/parser/parser.ts` | Nearley + moo. `NdM` becomes a `roll` node (`grammar.ne` `rollExpression` / `singleRollExpression`). Calculations are stored on properties as `parseNode` via the `computedField` schema. |
| Static compute (sheet) | `imports/api/engine/computation/...` | Computes modifiers, `advantage`, `passiveBonus`, etc. Dice stay unrolled here (`parseLevel: 'compile'`). |
| Action start (client) | `imports/client/ui/creature/actions/doAction.ts:37-97` | Inserts an `EngineAction`, then simulates it with an InputProvider whose `rollDice` = `getDeterministicDiceRoller(actionId)` (`:112`). If input is needed, it opens `ActionDialog`. |
| Apply property | `imports/api/engine/action/applyProperties/*.ts`, `tasks/applyCheckTask.ts` | Each property type has its own apply function (see 1.3). |
| Evaluate calc | `imports/api/engine/action/functions/recalculateCalculation.ts:16` (`recalculateCalculation`), `:59` (`rollAndReduceCalculation`) → `imports/parser/resolve.ts:13` | Resolve levels are `compile` → `roll` → `reduce`. Effects and proficiencies are applied between passes (`:36-44`). |
| Roll a die | `imports/parser/parseTree/roll.ts:61-93` | Calls `inputProvider.rollDice([{number, diceSize}])` (`:80`) and returns a `rollArray` node. On a crit, `context.options.doubleRolls` doubles the dice count (`:72-74`). |
| RNG | `getDeterministicDiceRoller.ts:7-28` | `Alea(actionId)` seeded PRNG. `~~(rand*diceSize)+1` (`:22`). The client simulation and the server replay produce identical rolls. |
| Server persist | `getReplayChoicesInputProvider.ts:7-35` via `runAction` | The server replays the saved `_decisions` and re-rolls deterministically. It does not trust client rolls. |
| Store / display | `TaskResult.appendLog` / `mutations` | Rolls are stored as **pre-formatted markdown strings** (e.g. `` `1d20 [ 14, ~~3~~ ] +5\n**19**` ``) plus scope variables (`~attackRoll`, `~attackDiceRoll`, `~saveRoll`, `~saveDiceRoll`, `~criticalHit`, ...). `ActionDialog.vue` renders them via `mutationToLogUpdates`. `rollArray.toString` (`parseTree/rollArray.ts:44-45,61-70`) formats data-driven rolls. |

### 1.2 Callers of `getDeterministicDiceRoller`

| Caller | Line |
|---|---|
| `imports/client/ui/creature/actions/doAction.ts` | `:112` (silent simulation provider) |
| `imports/client/ui/creature/actions/ActionDialog.vue` | `:125` (stored as `this.deterministicDiceRoller`, used by `rollDice()` at `:193-194`) |
| `imports/api/engine/action/functions/userInput/getReplayChoicesInputProvider.ts` | `:9` (server replay) |

### 1.3 All other dice entry points

| Entry point | file:line | Dice source |
|---|---|---|
| `roll` parse node | `imports/parser/parseTree/roll.ts:80` | **Data** (any calculation: Roll prop, damage, attack bonus, DC, inline calcs) |
| Attack roll | `applyProperties/applyActionProperty.ts:223,232,241` | **Hardcoded** `diceSize: 20` |
| Saving throw | `applyProperties/applySavingThrowProperty.ts:79,88,97` | **Hardcoded** `diceSize: 20` |
| Ability/skill check | `tasks/applyCheckTask.ts:83,92,101` | **Hardcoded** `diceSize: 20` |
| Random branch | `applyProperties/applyBranchProperty.ts:127` | Built in code (`1d<children.length>`), not d20 |
| `reroll()` / `explode()` parser functions | `imports/parser/functions.ts:206`, `:253` | Data, but they call `parser/rollDice.ts` **directly** (`DDP.randomStream`, `rollDice.ts:3`) and bypass the InputProvider. They are not deterministic, so the client simulation and the server replay can disagree. This matters if your system uses exploding dice. |
| Default computation provider | `imports/parser/resolve.ts:56-58` | Uses non-deterministic `parser/rollDice.ts`. Only used when no InputProvider is passed (e.g. `resolve()` function `functions.ts:135`). |
| `RollInput.vue` | `client/ui/creature/actions/input/RollInput.vue:34` | Dead path: the dice-animation input is commented out in `ActionDialog.vue:195-202`. |

---

## 2. Hardcoded d20 assumptions

`Override?` key: **Data** means a library/property can change it. **Code** means it needs a code change.

### 2.1 Engine (server + client simulation)

| file:line | Assumes | Override? |
|---|---|---|
| `api/engine/action/applyProperties/applyActionProperty.ts:213-218` | Advantage is a tri-state (`1/0/-1`) from `attack.advantage`/`disadvantage` counts | Code |
| `applyActionProperty.ts:222-230` | Advantage = roll `2d20`, keep higher | Code |
| `applyActionProperty.ts:231-239` | Disadvantage = roll `2d20`, keep lower | Code |
| `applyActionProperty.ts:241-242` | Base attack = `1d20` + `attack.value`; log text literal `1d20` | Code |
| `applyActionProperty.ts:244-247` | Crit is judged on the **single kept die** `value` (one number) | Code |
| `applyActionProperty.ts:251-254` | Crit hit if die ≥ `~criticalHitTarget`, default **20** | Threshold: **Data** (set `criticalHitTarget` variable). Condition shape (≥ single value): Code |
| `applyActionProperty.ts:256-258` | Crit miss if die ≤ `~criticalMissTarget`, default **1** | Threshold: **Data**. Shape: Code |
| `applyActionProperty.ts:131-133,147` | Crit hit auto-hits / crit miss auto-misses vs `armor` | Code |
| `applyActionProperty.ts:196-201` | No target: crit miss means never hit, crit hit means never miss | Code |
| `applySavingThrowProperty.ts:78-100` | Save = `1d20` + `save.value`; adv/dis = 2d20 keep 1; literal `1d20` text | Code |
| `applySavingThrowProperty.ts:105` | Success = total ≥ DC (no crits on saves) | Code |
| `tasks/applyCheckTask.ts:82-103` | Check = `1d20` + skill + ability mod; adv/dis = 2d20 keep 1; literal `1d20` text | Code |
| `tasks/applyCheckTask.ts:124-131` | TODO: `~checkRoll`/`~checkDiceRoll` are never set, so triggers can't read check results | Code |
| `applyProperties/applyDamageProperty.ts:41-45` | Crit = double the **number of dice** in damage rolls (`doubleRolls`) | Trigger is `~criticalHit` scope var (see §3.2). Effect: Code (`parseTree/roll.ts:72-74`) |
| `api/engine/computation/.../computeVariableAsSkill.js:71-81` | Passive bonus +5/−5 for adv/dis (5e rule). Note typo `bassiveBonus` at `:81`, so −5 never applies | Code |
| `computeVariableAsSkill.js:62-68`, `computeVariableAsAttribute.js:25-31`, `computeImplicitVariable.js:41-46` | Any number of advantage effects collapses to one tri-state value; adv + dis cancel out | Code |
| `api/engine/computation/.../aggregate/aggregateEffect.js:64-71`, `computeCalculation.js:84-88` | Effects `advantage`/`disadvantage` are counted, not stacked | Code |
| `api/engine/action/functions/userInput/InputProvider.ts:30-37,40` | `Advantage = 0 \| 1 \| -1`, described as "for a d20 roll" | Code (type) |

### 2.2 UI

| file:line | Assumes | Override? |
|---|---|---|
| `client/ui/properties/components/skills/SkillListTile.vue:97-99` | Passive score = `10 + value + passiveBonus` (d20 average) | Code (you can offset it with a `passiveAdd` effect, which is a hack) |
| `client/ui/properties/forms/SpellForm.vue:198` | "To Hit" field prefix literal `1d20 + ` | Code (cosmetic) |
| `client/ui/creature/actions/input/AdvantageInput.vue`, `CheckInput.vue:3-35,96-98` | Three-way Disadvantage / none / Advantage toggle bound to `advantage: -1/0/1`. No dice string is built or shown | Code (labels only) |
| `client/ui/properties/components/actions/ActionCard.vue:159-161`, `tabletop/TabletopActionCard.vue:149-151`, printed sheet `PrintedAction.vue:113`, `PrintedSpell.vue:87` | Show `attackRoll.value` as a signed "+N" bonus (implies a fixed die) | Fine for 2d10+N; no change needed |
| `client/ui/properties/forms/EffectForm.vue:180-181` | Help text "check will be at advantage" (and the disadvantage text also says "advantage", a bug) | Cosmetic |
| `api/properties/Skills.ts:9` | Doc comment: "modifier to be added to a D20" | Comment only |

Not d20 assumptions, but worth knowing: the `hitDiceSize` enum (`api/properties/Attributes.ts:43`, `AttributeForm.vue:49`) already allows `d10`. The other hits (`SelectedCreatureBar.vue:328` commented-out icon, `LevelUpDialog.vue:309`, `inputProviderForTests.testFn.ts:50`) are irrelevant.

---

## 3. Specific mechanics

### 3.1 Advantage / disadvantage
- **Computed** (sheet): advantage/disadvantage effects are counted per stat (`aggregateEffect.js:64-71`) and collapsed to `1/0/-1` (`computeVariableAsSkill.js:62-68` and siblings). Attack-roll fields get the counts on `calcObj.advantage/disadvantage` (`computeCalculation.js:84-88`).
- **At roll time**: the user can change it in `AdvantageInput`/`CheckInput` (`ActionDialog.vue:216-226`). The engine then rolls `{number: 2, diceSize: 20}` and keeps the max or min, in three duplicated copies (§2.1).
- **For "3d10 keep highest/lowest 2"**: replace those three blocks with one shared helper that rolls `{number: 3, diceSize: 10}` for adv/dis (`{2,10}` normally), sorts, keeps 2, and formats with strikethrough on the dropped die. The tri-state model, effects and UI can stay as they are. Stacking (e.g. 4d10 for double advantage) would additionally need the count preserved instead of collapsed in the three `computeVariable*` files.

### 3.2 Critical hits / fails
- **Detected only for attacks**, in `applyCrits` (`applyActionProperty.ts:251-267`), on the single kept d20. Saves and checks have no crit concept.
- **Configurable**: thresholds only. `~criticalHitTarget` and `~criticalMissTarget` are read from the action scope, so a creature variable/attribute named `criticalHitTarget` should work. The condition is always "kept die ≥ N" or "≤ N".
- **"Double 10s"** is impossible without code: `applyCrits` receives one number, not the individual dice. You need to pass the dice array and evaluate a condition such as `dice.every(d => d === 10)`, ideally a configurable predicate.
- Downstream, crits feed `~criticalHit` → damage dice doubling (`applyDamageProperty.ts:41-45`, `roll.ts:72-74`) and Branch `attackHit/attackMiss` (`applyBranchProperty.ts:70-112`).
- Library-side workaround (plausible, untested): a Roll property's `variableName` may start with `~` (`constants/VARIABLE_NAME_REGEX.js:2`), and `applyRollProperty.ts:57` writes it into scope. So a Roll named `~criticalHit` with a data-driven condition might trigger damage doubling for following Damage siblings.

### 3.3 Check/save/skill dialogs
The UI never builds a roll string. Clicking a skill/ability creates a `CheckTask` (`SkillListTile.vue:112`, `AbilityListTile.vue:100`, `AttributeCardContent.vue:85`) with `skillVariableName`/`abilityVariableName` and `advantage`. `CheckInput.vue` edits only those params. The dice (`1d20`) and the log string are produced by the engine in `applyCheckTask.ts:82-103`. Saves (`applySavingThrowProperty.ts`) and attacks behave the same way. **Data supplies only the modifier and the DC.**

### 3.4 Keep-highest / keep-lowest
- **No `kh`/`kl` syntax.** The lexer/grammar (`parser/grammar.ne:7-38,98-104`) only knows `NdM`.
- **Equivalent functions already exist**: `dropLowest(3d10, 1)` (= keep highest 2) and `dropHighest(3d10, 1)` (= keep lowest 2), `parser/functions.ts:140-185`. They mark dice `disabled`, and `rollArray.reduce` skips those (`parseTree/rollArray.ts:47-51`). They work in any data-driven calculation (Roll property, damage).
- **Limitations**: you can't index individual dice (`parseTree/indexNode.ts:39` handles `array` only, not `rollArray`), so you can't detect "doubles" inside one roll expression. Workaround: roll `a = 1d10`, `b = 1d10` as separate Roll properties, then compare them.
- **Adding `3d10kh2`**: add a postfix rule to `rollExpression` in `grammar.ne` (e.g. `rollExpression %name number`, matching `kh`/`kl`) that maps to `call(dropLowest/dropHighest)` with `n - k`. Then regenerate `grammar.js` with `nearleyc`. Note that `kh2` already lexes as a `name` token (`grammar.ne:16`), so the rule must look for that name pattern rather than add new tokens. It's about a day of work including tests (`parser/parser.test.js`).

---

## 4. Verdict

### 4.1 Pure library (no fork)?
**Not cleanly.** What works through data:
- Roll properties with `2d10 + mod`, `dropLowest(3d10,1) + mod`, Branch on results, custom crit logic via separate Roll properties.
- Damage dice, crit thresholds (`criticalHitTarget`/`criticalMissTarget`).

**Blockers:**
1. **Skill/ability checks** (clicking a skill on the sheet) always roll 1d20 (`applyCheckTask.ts:82-103`). You can't avoid this short of never clicking skills and instead adding an Action per skill.
2. **Saving Throw property** always rolls 1d20 (`applySavingThrowProperty.ts:78-100`), and its `~saveSucceeded/~saveFailed` branching depends on it. You would need to rebuild saves as Roll + Branch(calculation).
3. **Attack rolls** (`attackRoll` on Action/Spell) always roll 1d20 with 5e advantage and single-die crits (`applyActionProperty.ts:213-267`). The hit/miss/crit branches and the damage doubling are wired to it.
4. **Passive scores** and the +5 adv bonus are 10/5-based (`SkillListTile.vue:98`, `computeVariableAsSkill.js:71-81`).
5. The advantage toggle in the dialogs only affects the hardcoded paths. Roll properties ignore it.

A library can fake everything with Actions → Roll → Branch trees. However, it loses the built-in attack/save/check UX, the advantage UI and the tabletop hit/miss logic, and every sheet click on a skill would still show a d20 roll.

### 4.2 Minimal fork: one dice-system config
Add `imports/constants/DICE_SYSTEM.ts` (or read it from creature-scope variables so a library can set it), for example:

```ts
export default {
  core: { number: 2, diceSize: 10, keep: 2 },        // normal roll
  advantage: { number: 3, keep: 2, keepHighest: true },
  disadvantage: { number: 3, keep: 2, keepHighest: false },
  isCritHit: (dice: number[]) => dice.every(d => d === 10),
  isCritMiss: (dice: number[]) => dice.every(d => d === 1),
  passiveBase: 11, passiveAdvantageBonus: 0,
};
```

Plus one helper `rollCoreDice(userInput, advantage) → { kept, all, total, resultPrefix }` that the hardcoded spots call.

Changes ranked by effort:

| # | Change | Files | Effort |
|---|---|---|---|
| 1 | Add `DICE_SYSTEM` config + `rollCoreDice` helper (roll N, keep K, format log with strikethrough) | new `api/engine/action/functions/rollCoreDice.ts` | S (≈½ day) |
| 2 | Replace the three duplicated adv/dis/normal blocks with `rollCoreDice` | `applyActionProperty.ts:213-243`, `applySavingThrowProperty.ts:77-100`, `applyCheckTask.ts:80-103` | S (mechanical) |
| 3 | Crit detection on the dice array via the config predicate (keep `~criticalHitTarget` as optional override) | `applyActionProperty.ts:244-267` | S |
| 4 | Passive base/adv bonus from config; fix `bassiveBonus` typo | `SkillListTile.vue:98`, `computeVariableAsSkill.js:71-81` | XS |
| 5 | Cosmetic: `1d20 + ` prefix, help text | `SpellForm.vue:198`, `EffectForm.vue:180-181`, `InputProvider.ts:31` | XS |
| 6 | Update tests that assert d20 behaviour | `applyActionProperty.test.ts`, `applySavingThrowProperty.test.ts`, `inputProviderForTests.testFn.ts:50` | S–M |
| 7 | *(optional)* Route `reroll`/`explode` through the InputProvider so they're deterministic | `parser/functions.ts:206,253`, call-site plumbing in `parseTree/call.ts` | M |
| 8 | *(optional)* `kh`/`kl` grammar sugar | `parser/grammar.ne` → regenerate `grammar.js` | M |
| 9 | *(optional)* Stackable advantage (keep counts instead of the tri-state) | `computeVariable*.js`, `InputProvider.ts:40`, `CheckInput.vue`, `AdvantageInput.vue` | M–L |

Items 1–5 make up the minimum viable fork, at roughly 1–2 days plus testing. No schema or DB migration is needed, because roll results are stored as log strings and scope numbers. Old d20 logs stay as they are.

---

## 5. Hosting check

### 5.1 Pinned versions

| Component | Pinned | Source |
|---|---|---|
| Meteor | **2.16** | `app/.meteor/release` (`METEOR@2.16`) |
| Node | **14.x** (Meteor 2.16 bundles Node 14.21.x). `engines.node: "14.0.x"`, npm `6.13.x` | `app/package.json` `engines`; `Dockerfile` installs `setup_14.x` |
| MongoDB driver | `npm-mongo@4.17.2`, `mongo@1.16.10` | `app/.meteor/versions` |
| MongoDB server | **Unpinned**: `mongo:latest` | `docker-compose.yml` |
| Build target | `--architecture os.linux.x86_64` hardcoded | `app/package.json` `build` script, `Dockerfile:21` |

### 5.2 aarch64 (Oracle Ampere A1 / Neoverse N1)

| Component | aarch64? | Notes |
|---|---|---|
| Meteor 2.16 **tool** (dev/build) | **No official Linux ARM64 build.** Per the Meteor team, Linux ARM arrived in Meteor 3.x; 2.x only got ARM for macOS (2.5.6+) | Build the bundle on x86_64 (CI or locally), then deploy the bundle. |
| Meteor 2.16 **server bundle** | **Yes, with a rebuild.** A bundle is plain Node 14 + npm deps | Run `npm install` in `bundle/programs/server` **on the ARM host** so native modules (`fibers`, `bcrypt`) compile for arm64. Drop the `--architecture os.linux.x86_64` assumption, or keep it and rebuild native modules on the target. |
| Node 14 | Yes, there are official linux-arm64 binaries | EOL since April 2023; there are no security updates beyond Meteor's own patched 14.21.x. |
| MongoDB server | Yes, the official `mongo` images are multi-arch, and 5.0+ needs ARMv8.2-A, which Ampere Altra meets | **Pin it.** `mongo:latest` is currently 8.x, but driver 4.17 is only officially tested up to MongoDB 7.0. Use `mongo:7.0`. |
| `sharp@0.33.2` | Has arm64 prebuilds, **but needs Node ≥18.17** | Listed in `package.json` but never imported in `imports/`/`server/`. It will likely fail to install or load on Node 14 on any architecture. Remove it or ignore it. |
| `bcrypt@5.1.1` | Builds from source on arm64 if no prebuild | Also not imported directly. Needs `python3`/`make`/`g++` in the image. |

**Bottom line for Ampere:** it is feasible as "build on x86, run the bundle on ARM with Node 14 + `npm install` on the host + `mongo:7.0`". Developing *on* the ARM box needs an upgrade to Meteor 3.x, which is a large migration (Fibers removal, async APIs).

Sources:
- [Meteor forum: Release 2.16.1-beta.0 is intel only, can arm64 be added](https://forums.meteor.com/t/release-2-16-1-beta-0-is-intel-only-can-arm64-be-added/63405)
- [Meteor forum: Using Meteor 3.0 alpha on Linux arm64](https://forums.meteor.com/t/howto-using-newest-meteor-3-0-alpha-at-linux-arm64/60921)
- [meteor-feature-requests #130 (ARM support)](https://github.com/meteor/meteor-feature-requests/issues/130)
