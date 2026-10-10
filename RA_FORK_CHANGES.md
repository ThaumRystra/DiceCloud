# Reverent Abyss fork: changes from upstream DiceCloud

Tier 1 (branch `ra/2d10-core`, based on upstream `develop` @ `88fc9c83`) replaces the d20 core roll with the Reverent Abyss 2d10 system.

## Rules implemented

- **Core roll:** attacks, checks and saving throws roll 2d10 + modifier.
- **Advantage:** advantage +N and disadvantage −N cancel numerically. A net N ≠ 0 rolls `2 + |N|` d10 and keeps the 2 highest (N > 0) or the 2 lowest (N < 0). Net advantage is clamped to ±10.
- **Crits (attacks only):** a crit is a kept sum ≥ `20 − critChance`. There are no critical misses.
- **Saves:** succeed when total ≥ DC. Saves now show the same advantage prompt as checks and attacks.

- **Ability modifiers:** an ability score's modifier comes from the Reverent Abyss stat table, using the highest threshold it meets: 2–3 is −3, 7 is 0, 8 is +1, 9–10 is +2, up to 70+ at +15. Scores below 2 get −4. This replaces D&D's `floor((score − 10) / 2)`.

Dice tunables live in `app/imports/constants/RA_DICE.ts`, and the stat table lives in `app/imports/constants/RA_ABILITY.ts`.

## New files

All new logic lives in these files, so upstream merges stay cheap.

| File | Purpose |
|---|---|
| `app/imports/constants/RA_DICE.ts` | Dice config: `diceSize`, `keep`, `critBase`, `maxAdvantage` |
| `app/imports/constants/RA_ABILITY.ts` | Stat → modifier table (`STAT_THRESHOLDS`, `STAT_MODIFIERS`) and `abilityModifier(stat)` |
| `app/imports/constants/RA_ABILITY.test.ts` | Tests for every row of the table and its edges |
| `app/imports/api/engine/action/functions/rollCoreDice.ts` | Shared roller (`rollCoreDice`), plus `clampAdvantage`, `advantageSuffix` and `writeCoreDiceScope` |
| `app/imports/api/engine/action/functions/rollCoreDice.test.ts` | Roller unit tests |
| `app/imports/api/engine/action/tasks/applyCheckTask.test.ts` | Check task tests, the first for this file |
| `app/imports/client/ui/creature/actions/input/AdvantageStepper.vue` | − / value / + / reset stepper for numeric advantage |
| `RA_FORK_CHANGES.md` | This file |

## Modified upstream files

### Engine

- `api/engine/action/applyProperties/applyActionProperty.ts`: `rollAttack` calls `rollCoreDice`. `applyCrits` uses `critBase − critChance`, and the default crit-miss target is now `-Infinity`.
- `api/engine/action/applyProperties/applySavingThrowProperty.ts`: asks `advantage()` for each save, then rolls with `rollCoreDice`.
- `api/engine/action/tasks/applyCheckTask.ts`: rolls with `rollCoreDice` and pushes the `~check*` variables to scope, which resolves the upstream TODO.
- `api/engine/action/functions/userInput/InputProvider.ts`: `Advantage` changed from `0 | 1 | -1` to `number`, and the doc comment updated.

### Computation

- `api/engine/computation/computeComputation/computeByType/computeVariable/aggregate/aggregateEffect.js`: advantage and disadvantage effects sum their amount instead of counting instances. A blank amount counts as 1.
- `api/engine/computation/computeComputation/computeByType/computeCalculation.js`: the same summing for effects on calculations, such as attack rolls. `fail` still counts instances. The advantage and disadvantage totals are cleared before summing, because actions re-run this aggregation on an already computed calculation (`recalculateCalculation`), which used to count every effect twice.
- `api/engine/computation/computeComputation/computeByType/computeVariable/computeVariableAsSkill.js`: stores net advantage, and the 5e passive ±5 advantage bonus is removed.
- `api/engine/computation/computeComputation/computeByType/computeVariable/computeVariableAsAttribute.js`: stores net advantage instead of collapsing it to −1, 0 or 1, and ability modifiers come from `abilityModifier()` in `RA_ABILITY.ts`. That computed `modifier` field is the only place the modifier is calculated; the sheet, skills, checks, spell lists and `.modifier` calculations all read it.
- `api/engine/computation/computeComputation/computeByType/computeVariable/computeImplicitVariable.js`: stores net advantage instead of collapsing it to −1, 0 or 1.

### Schemas

- `api/properties/Attributes.ts`: removes `allowedValues: [-1, 0, 1]` from `advantage`. The field is still an integer.
- `api/properties/Skills.ts`: removes `allowedValues: [-1, 0, 1]` from `advantage`. The field is still an integer.

### UI

- `client/ui/creature/actions/input/AdvantageInput.vue`: uses `AdvantageStepper` instead of the toggle, and the extra-hex offset uses `Math.sign`.
- `client/ui/creature/actions/input/CheckInput.vue`: uses `AdvantageStepper` instead of the toggle, and the extra-hex offset uses `Math.sign`.
- `client/ui/properties/forms/EffectForm.vue`: advantage and disadvantage effects now accept an amount, and the help text is fixed.
- `client/ui/properties/forms/SpellForm.vue`: the To Hit prefix reads `2d10 + `.

### Tests

- `api/engine/action/functions/userInput/inputProviderForTests.testFn.ts`: `critInputProvider` rolls two 10s on the 2d10 core roll.
- `api/engine/action/applyProperties/applyActionProperty.test.ts`: expectations updated to 2d10, plus new crit and stacked-advantage tests.
- `api/engine/action/applyProperties/applySavingThrowProperty.test.ts`: expectations updated to 2d10 (the DC is now 14), plus new advantage tests.
- `api/engine/action/applyProperties/applyBranchProperty.test.ts`: expectations updated to 2d10. The miss fixture's attack bonus changed from −1 to −2 so it still misses.
- `api/engine/action/applyProperties/applyDamageProperty.test.ts`: the crit attack line now reads 2d10.
- `api/engine/computation/computeComputation/tstFns/computeSkills.testFn.js`: new tests for stacked advantage and for no passive bonus from advantage. Skill values updated for RA modifiers.
- `api/engine/computation/computeComputation/tstFns/computeAttribute.testFn.js`: expected modifiers updated for the RA table (12 → +3, 15 → +4, 21 → +6).
- `api/engine/computation/computeComputation/tstFns/computeProficiencies.testFn.js`: expected modifier updated for the RA table (8 → +1).

Paths are relative to `app/imports/`.

## Scope variables

Triggers, branches and calculations can read these during an action.

| Variable | Meaning |
|---|---|
| `~attackRoll` | Attack total (kept sum + modifier). Kept for back-compat |
| `~attackDiceRoll` | Kept 2d10 sum. Kept for back-compat; it used to be the single d20 |
| `~attackDie1`, `~attackDie2` | **New.** The kept dice, in roll order |
| `~saveRoll` | Save total. Kept for back-compat |
| `~saveDiceRoll` | Kept 2d10 sum. Kept for back-compat |
| `~saveDie1`, `~saveDie2` | **New.** The kept dice, in roll order |
| `~checkRoll` | **New.** Check total |
| `~checkDiceRoll` | **New.** Kept 2d10 sum |
| `~checkDie1`, `~checkDie2` | **New.** The kept dice, in roll order |
| `critChance` | **New, read from the attacker.** Each point lowers the crit target by 1, from a base of 20. Define it as an attribute (e.g. a stat named `critChance`) and raise it with Effects |
| `~criticalHitTarget` | Unchanged. If set, it overrides `20 − critChance` |
| `~criticalMissTarget` | Unchanged. If set, it re-enables crit misses at or below that kept sum. Otherwise there are none |

## Granting advantage (for library authors)

Create an **Effect** property:

- **Operation:** Advantage (or Disadvantage)
- **Value:** N, the number of extra dice. Leave it blank for 1, which matches upstream behaviour.
- **Target:** the stat by variable name (e.g. `strengthSave`, `athletics`, `strength`), or properties by tag (e.g. tag an action to give its attack roll advantage).

Effects stack numerically. Advantage 2, advantage (blank) and disadvantage 1 on the same stat net **Advantage +2**, which rolls 4d10 and keeps the highest 2. Ability advantage still flows to skills based on that ability, but not to saves, as in upstream. Players can adjust the suggested value with the stepper when they roll.

## Behaviour notes

- **Log format:** all three rolls now use `2d10 [ 5, 6 ] + 3`. Checks previously printed an unspaced modifier (`+3`), and attacks printed `[10]` without inner spaces. When the roll has advantage, the log text is prefixed with `Advantage +N` or `Disadvantage −N`.
- **New saving throw decision:** saves now call `advantage()`, which adds one entry per save target to an action's saved `_decisions`. An action saved by older client code that contains a save would replay out of order. Actions replay immediately when they run, so this only matters for actions that were in flight across a deploy.
- **Non-finite modifiers:** a non-finite modifier, such as a save stat with no value, is treated as 0. Upstream produced a total of 0 for saves in this case.
- **Double-counted effects (upstream bug):** during an action, upstream counted advantage effects on calculations twice. The 0/1/−1 collapse hid this until amounts became numeric. Advantage is fixed. `fail` on calculations is still double-counted, but it's only checked for truthiness, so it's left as upstream.
- **Non-integer amounts:** an advantage amount that is not an integer is truncated toward zero when rolled. The computed `advantage` field on attributes and skills is still a `SimpleSchema.Integer`, so authors should use whole numbers.

## Merge-conflict hotspots when pulling upstream

1. **`applyActionProperty.ts`, `rollAttack` and `applyCrits`:** the most likely place for conflicts. If upstream changes crit or advantage handling, keep our versions of these two functions and port their other changes around them.
2. **`applySavingThrowProperty.ts`, the roll block:** about 6 lines, between the missing-save error and `~saveRoll`.
3. **`applyCheckTask.ts`:** the roll block, plus the removed TODO at the bottom of the file. If upstream implements `~check*` itself, keep only one version.
4. **The ability modifier line** in `computeVariableAsAttribute.js` (`prop.modifier = abilityModifier(prop.value)`). Any new upstream code that recomputes `(score - 10) / 2` should call `abilityModifier()` instead.
5. **The computation `advantage` lines** in `computeVariableAsSkill.js`, `computeVariableAsAttribute.js`, `computeImplicitVariable.js`, `aggregateEffect.js` and `computeCalculation.js`. Each is a one-line swap. Any new upstream code that compares `advantage === 1` or `advantage === -1` must become `> 0` or `< 0`.
6. **`AdvantageInput.vue` and `CheckInput.vue`:** if upstream restyles these inputs, re-apply the `<advantage-stepper>` swap.
7. **Tests:** upstream test expectations that contain `1d20 [...]` strings need converting. With the test roller, a normal roll is `2d10 [ 5, 6 ]`, or 11.
8. **New d20 call sites:** search upstream diffs for `diceSize: 20`. Any new hardcoded d20 roll should go through `rollCoreDice`.
