# Rule Injection Point Catalog

This document catalogs every identified injection point where D&D 5e-specific logic exists and where new game system rules could be plugged in.

---

## Summary Table

| # | Injection Point | Type | Files | Effort | Priority |
|---|----------------|------|-------|--------|----------|
| 1 | Ability Modifier Formula | Calculation | computeVariableAsAttribute.js | Low | P1 |
| 2 | Hit Dice Constitution Dependency | Calculation | computeVariableAsAttribute.js, linkTypeDependencies.js | Low | P2 |
| 3 | Proficiency Bonus Reference | Calculation | computeSkill.js, computeVariableAsSkill.js, computeCalculation.js, linkTypeDependencies.js | Medium | P1 |
| 4 | Half-Proficiency Rounding (0.49) | Calculation | computeSkill.js, computeVariableAsSkill.js, computeCalculation.js | Low | P2 |
| 5 | Passive Skill +/-5 | Calculation | computeVariableAsSkill.js | Low | P3 |
| 6 | Damage Types List | Config | DAMAGE_TYPES.js | Low | P1 |
| 7 | Property Types Registry | Config | PROPERTIES.js, propertySchemasIndex.js | Medium | P1 |
| 8 | Attribute Types Enum | Schema | Attributes.ts | Low | P2 |
| 9 | Skill Types Enum | Schema | Skills.ts | Low | P2 |
| 10 | Effect Operations Enum | Schema | Effects.ts | Low | P2 |
| 11 | Character Sheet Tabs | UI | CharacterSheet.vue | Medium | P2 |
| 12 | Stats Tab Layout | UI | StatsTab.vue | Medium | P2 |
| 13 | Rest System (Short/Long) | Calculation | applyResetTask.ts | Medium | P2 |
| 14 | Hit Dice Reset Logic | Calculation | applyResetTask.ts | Low | P2 |
| 15 | Default Character Properties | Config | defaultCharacterProperties.js | Low | P1 |
| 16 | Compute By Type Registry | Calculation | computeByType.js | Medium | P1 |
| 17 | Link Dependencies By Type | Calculation | linkTypeDependencies.js | Medium | P1 |
| 18 | Reserved Variable Names | Config | RESERVED_VARIABLE_NAMES.js | Low | P3 |
| 19 | Built-in Tags | Config | BUILT_IN_TAGS.js | Low | P3 |
| 20 | Creature Settings | Schema | Creatures.ts | Medium | P2 |
| 21 | Action Type Enum | Schema | Actions.ts | Low | P3 |
| 22 | Spell Properties | Schema | Spells.ts, SpellLists.ts | Medium | P2 |
| 23 | Property Form Components | UI | propertyFormIndex.js | Medium | P2 |
| 24 | Property Viewer Components | UI | propertyViewerIndex.js | Medium | P2 |
| 25 | Library System | Library | Libraries.js, LibraryNodes.ts | Low | P1 |

---

## Detailed Injection Points

### Injection Point 1: Ability Modifier Formula
- **File(s):** `app/imports/api/engine/computation/computeComputation/computeByType/computeVariable/computeVariableAsAttribute.js:35-37`
- **Type:** Calculation
- **Current behavior:** Hardcodes `Math.floor((prop.value - 10) / 2)` for `attributeType === 'ability'`. This is the standard D&D 5e ability modifier formula.
- **How to extend:** Replace with a configurable formula function. The formula could be stored on the creature or resolved from a game system config. For example, a `modifierFormula` field on the attribute or a system-level formula registry.
- **Effort:** Low
- **Blocks:** Any system without the `(score - 10) / 2` modifier formula (most non-D&D systems)

```javascript
// Current
if (prop.attributeType === 'ability') {
  prop.modifier = Math.floor((prop.value - 10) / 2);
}

// Proposed: delegate to system-configurable formula
if (prop.attributeType === 'ability') {
  prop.modifier = computeModifier(prop.value, prop);
}
```

---

### Injection Point 2: Hit Dice Constitution Dependency
- **File(s):** `app/imports/api/engine/computation/computeComputation/computeByType/computeVariable/computeVariableAsAttribute.js:40-42` and `app/imports/api/engine/computation/buildComputation/linkTypeDependencies.js:109-112`
- **Type:** Calculation
- **Current behavior:** Hit dice (`attributeType === 'hitDice'`) hardcode a dependency on the `constitution` variable to get `constitutionMod`.
- **How to extend:** Make the linked ability for hit dice configurable via a field on the hit dice property rather than hardcoding `'constitution'`.
- **Effort:** Low
- **Blocks:** Systems where hit dice don't use Constitution (or don't exist at all)

```javascript
// Current (linkTypeDependencies.js)
if (prop.attributeType === 'hitDice') {
  dependencyGraph.addLink(prop._id, 'constitution', 'hitDiceConMod');
}

// Current (computeVariableAsAttribute.js)
if (prop.attributeType === 'hitDice') {
  prop.constitutionMod = computation.scope['constitution']?.modifier || 0;
}
```

---

### Injection Point 3: Proficiency Bonus Reference
- **File(s):**
  - `app/imports/api/engine/computation/computeComputation/computeByType/computeSkill.js:8`
  - `app/imports/api/engine/computation/computeComputation/computeByType/computeVariable/computeVariableAsSkill.js:21`
  - `app/imports/api/engine/computation/computeComputation/computeByType/computeCalculation.js:25`
  - `app/imports/api/engine/computation/buildComputation/linkTypeDependencies.js:292,335`
- **Type:** Calculation
- **Current behavior:** Skills and calculations hardcode a dependency on `computation.scope['proficiencyBonus']`. All skills automatically link to the `proficiencyBonus` variable in the dependency graph.
- **How to extend:** Make the proficiency bonus variable name configurable per-system. Some systems might not have proficiency bonuses at all, or call them something different. Could be a system-level constant or a field on the skill/creature.
- **Effort:** Medium
- **Blocks:** Systems without proficiency bonus (Pathfinder 2e uses level-based proficiency; many systems have no such concept)

---

### Injection Point 4: Half-Proficiency Rounding (0.49 Magic Number)
- **File(s):**
  - `app/imports/api/engine/computation/computeComputation/computeByType/computeSkill.js:10-15`
  - `app/imports/api/engine/computation/computeComputation/computeByType/computeVariable/computeVariableAsSkill.js:23-29`
  - `app/imports/api/engine/computation/computeComputation/computeByType/computeCalculation.js:205-210`
- **Type:** Calculation
- **Current behavior:** Uses `0.49` as a magic number for "half proficiency rounded down" (D&D 5e Jack of All Trades). Standard half proficiency is `0.5` (rounds up), so `0.49` triggers special `Math.floor(profBonus * 0.5)` logic.
- **How to extend:** Document this convention clearly; consider making rounding behavior part of the proficiency value's metadata rather than a magic number.
- **Effort:** Low
- **Blocks:** Non-issue for most systems since proficiency values are already stored as data

```javascript
// Current
if (prop.proficiency === 0.49) {
  profBonus = Math.floor(profBonus * 0.5);
} else {
  profBonus = Math.ceil(profBonus * prop.proficiency);
}
```

---

### Injection Point 5: Passive Skill +/- 5 for Advantage/Disadvantage
- **File(s):** `app/imports/api/engine/computation/computeComputation/computeByType/computeVariable/computeVariableAsSkill.js:72-82`
- **Type:** Calculation
- **Current behavior:** Adds +5 to passive score for advantage, -5 for disadvantage (D&D 5e rule).
- **How to extend:** Make the passive bonus for advantage/disadvantage configurable (or zero for systems without this concept).
- **Effort:** Low
- **Blocks:** Systems without passive skills or with different advantage mechanics

---

### Injection Point 6: Damage Types List
- **File(s):** `app/imports/constants/DAMAGE_TYPES.js`
- **Type:** Config
- **Current behavior:** Frozen array of D&D 5e damage types: `['healing', 'bludgeoning', 'piercing', 'slashing', 'acid', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'poison', 'psychic', 'radiant', 'thunder', 'extra']`
- **How to extend:** Make this data-driven from a game system config. Different systems have very different damage types (e.g., Pathfinder 2e has more types; Call of Cthulhu has none).
- **Effort:** Low
- **Blocks:** Any system with different damage taxonomy

---

### Injection Point 7: Property Types Registry
- **File(s):**
  - `app/imports/constants/PROPERTIES.js` (metadata: icons, names, suggested parents)
  - `app/imports/api/properties/propertySchemasIndex.js` (schema registry)
  - `app/imports/api/properties/computedPropertySchemasIndex.js` (computed schemas)
  - `app/imports/api/properties/computedOnlyPropertySchemasIndex.js`
- **Type:** Config
- **Current behavior:** Statically imports and registers all 28+ property types. Each type has a schema, icons, help text, and suggested parent types. Adding a new type requires editing multiple files.
- **How to extend:** Create a registration pattern where game system modules can register additional property types at startup. This is one of the highest-value changes.
- **Effort:** Medium
- **Blocks:** Systems needing custom property types (e.g., Blades in the Dark needs "Clock" properties)

---

### Injection Point 8: Attribute Types Enum
- **File(s):** `app/imports/api/properties/Attributes.ts:27-38`
- **Type:** Schema
- **Current behavior:** `attributeType` enum includes D&D-specific types: `['ability', 'stat', 'modifier', 'hitDice', 'healthBar', 'resource', 'spellSlot', 'utility']`
- **How to extend:** Make this extensible or configurable per game system. Many systems won't have hit dice or spell slots.
- **Effort:** Low
- **Blocks:** Systems needing custom attribute subtypes

---

### Injection Point 9: Skill Types Enum
- **File(s):** `app/imports/api/properties/Skills.ts:36-46`
- **Type:** Schema
- **Current behavior:** `skillType` enum: `['skill', 'save', 'check', 'tool', 'weapon', 'armor', 'language', 'utility']`
- **How to extend:** Make extensible. Different systems categorize proficiencies differently.
- **Effort:** Low
- **Blocks:** Systems with different skill categorization

---

### Injection Point 10: Effect Operations Enum
- **File(s):** `app/imports/api/properties/Effects.ts:18-31`
- **Type:** Schema
- **Current behavior:** Effect operations: `['base', 'add', 'mul', 'min', 'max', 'set', 'advantage', 'disadvantage', 'passiveAdd', 'fail', 'conditional']`. The `advantage`/`disadvantage` operations are D&D-specific.
- **How to extend:** Make the operations list extensible for systems with different modifier types.
- **Effort:** Low
- **Blocks:** Systems needing custom effect operations

---

### Injection Point 11: Character Sheet Tabs
- **File(s):** `app/imports/client/ui/creature/character/CharacterSheet.vue`
- **Type:** UI
- **Current behavior:** Hardcoded 8 tabs: Stats, Actions, Spells, Inventory, Features, Journal, Build, Tree. Some are conditionally hidden via creature settings.
- **How to extend:** Make tab definitions data-driven, loaded from game system config. Each system could specify its own tab layout.
- **Effort:** Medium
- **Blocks:** Systems with different sheet layouts (e.g., Blades in the Dark needs Playbook/Crew tabs)

---

### Injection Point 12: Stats Tab Layout
- **File(s):** `app/imports/client/ui/creature/character/characterSheetTabs/StatsTab.vue`
- **Type:** UI
- **Current behavior:** Renders D&D-specific sections in a specific order: Health Bars, Ability Scores, Stats, Modifiers, Hit Dice, Resources, Spell Slots, Saving Throws, Skills (by type: weapon, armor, tool, language). Uses `propertyHandlers` to map property types to UI sections.
- **How to extend:** Make the `propertyHandlers` and section rendering order configurable per game system.
- **Effort:** Medium
- **Blocks:** Systems with different stat display needs

---

### Injection Point 13: Rest System (Short/Long)
- **File(s):** `app/imports/api/engine/action/tasks/applyResetTask.ts`
- **Type:** Calculation
- **Current behavior:** Hardcodes two rest types: `shortRest` and `longRest`. Long rests also trigger short rest resets. Has special hit dice recovery logic for long rests.
- **How to extend:** Make rest types configurable. Some systems have different rest mechanics (8-hour vs. 10-minute rests, downtime activities, etc.).
- **Effort:** Medium
- **Blocks:** Systems with different rest mechanics

---

### Injection Point 14: Hit Dice Reset Logic
- **File(s):** `app/imports/api/engine/action/tasks/applyResetTask.ts:130-171`
- **Type:** Calculation
- **Current behavior:** On long rest, recovers hit dice equal to `Math.floor(totalHd * resetMultiplier)` (default 0.5), starting with the highest dice. This is D&D 5e's specific hit dice recovery rule.
- **How to extend:** This is already somewhat configurable via `hitDiceResetMultiplier` in creature settings. Could be further generalized to support different recovery mechanics.
- **Effort:** Low
- **Blocks:** Minor; already partially configurable

---

### Injection Point 15: Default Character Properties
- **File(s):** `app/imports/api/creature/creatures/defaultCharacterProperties.js`
- **Type:** Config
- **Current behavior:** Creates a "Ruleset" slot (tagged `base`), plus Inventory, Equipment, and Carried folders. This is already system-agnostic in design -- the Ruleset slot is meant to be filled from a library.
- **How to extend:** This is already an excellent extensibility pattern. Different game system libraries can provide different base rulesets that fill this slot. No changes needed.
- **Effort:** Low (already extensible)
- **Blocks:** Nothing -- this is the primary extensibility mechanism

---

### Injection Point 16: Compute By Type Registry
- **File(s):** `app/imports/api/engine/computation/computeComputation/computeByType.js`
- **Type:** Calculation
- **Current behavior:** Static map of `type -> computeFunction` for computing properties during the dependency graph traversal. Only 11 types have custom compute logic (others default to `_variable` or `_calculation`).
- **How to extend:** Make this registry extensible so game system modules can register custom compute functions for new property types.
- **Effort:** Medium
- **Blocks:** Custom property types that need custom computation logic

---

### Injection Point 17: Link Dependencies By Type Registry
- **File(s):** `app/imports/api/engine/computation/buildComputation/linkTypeDependencies.js`
- **Type:** Calculation
- **Current behavior:** Static map of `type -> linkFunction` that establishes dependency graph edges during build phase.
- **How to extend:** Make this registry extensible for custom property types.
- **Effort:** Medium
- **Blocks:** Custom property types that need custom dependency linking

---

### Injection Point 18: Reserved Variable Names
- **File(s):** `app/imports/constants/RESERVED_VARIABLE_NAMES.js`
- **Type:** Config
- **Current behavior:** Reserves `['allChecks', 'allSaves', 'attackRolls']` as special variable names that aggregate across multiple properties.
- **How to extend:** Make extensible per game system. Different systems might need different reserved aggregation variables.
- **Effort:** Low
- **Blocks:** Minor

---

### Injection Point 19: Built-in Tags
- **File(s):** `app/imports/constants/BUILT_IN_TAGS.js`
- **Type:** Config
- **Current behavior:** Three built-in tags: `inventory`, `equipment`, `carried`. These control item placement and behavior in the inventory system.
- **How to extend:** Could be extended with system-specific tags.
- **Effort:** Low
- **Blocks:** Minor

---

### Injection Point 20: Creature Settings
- **File(s):** `app/imports/api/creature/creatures/Creatures.ts:8-61`
- **Type:** Schema
- **Current behavior:** `CreatureSettingsSchema` includes D&D-specific settings: `useVariantEncumbrance`, `hideSpellcasting`, `hideRestButtons`, `swapStatAndModifier`, `hideSpellsTab`, `hitDiceResetMultiplier`.
- **How to extend:** Add a `gameSystem` field on the creature that determines which settings are relevant. Game-specific settings could be stored in an extensible sub-object.
- **Effort:** Medium
- **Blocks:** Systems needing different character-level settings

---

### Injection Point 21: Action Type Enum
- **File(s):** `app/imports/api/properties/Actions.ts`
- **Type:** Schema
- **Current behavior:** Action types include D&D-specific values like `bonus` (bonus action), `reaction`, `long` (long action for Pathfinder compat). Already somewhat system-agnostic.
- **How to extend:** Make extensible per game system.
- **Effort:** Low
- **Blocks:** Minor

---

### Injection Point 22: Spell Properties
- **File(s):** `app/imports/api/properties/Spells.ts`, `app/imports/api/properties/SpellLists.ts`
- **Type:** Schema
- **Current behavior:** Spell schemas encode D&D 5e concepts: spell levels (0-9), schools, components (V/S/M), concentration, ritual casting, prepared vs. known.
- **How to extend:** These could be generalized. Some systems don't have spell levels, schools, or the same component system.
- **Effort:** Medium
- **Blocks:** Systems with different magic mechanics

---

### Injection Point 23: Property Form Components
- **File(s):** `app/imports/client/ui/properties/forms/shared/propertyFormIndex.js`
- **Type:** UI
- **Current behavior:** Static map of `type -> FormComponent` for editing properties. Each of the 28+ property types has a dedicated Vue form component.
- **How to extend:** Make the form index extensible so game system modules can register custom form components for new property types.
- **Effort:** Medium
- **Blocks:** Custom property types that need custom edit forms

---

### Injection Point 24: Property Viewer Components
- **File(s):** `app/imports/client/ui/properties/viewers/shared/propertyViewerIndex.js`
- **Type:** UI
- **Current behavior:** Static map of `type -> ViewerComponent` for displaying properties.
- **How to extend:** Same as forms -- make the index extensible.
- **Effort:** Medium
- **Blocks:** Custom property types that need custom display components

---

### Injection Point 25: Library System (Extensibility Mechanism)
- **File(s):** `app/imports/api/library/Libraries.js`, `app/imports/api/library/LibraryNodes.ts`, `app/imports/api/library/LibraryCollections.js`
- **Type:** Library
- **Current behavior:** Libraries are collections of reusable property templates that can be shared and imported into characters. The slot system allows characters to pull in "base rulesets" from libraries.
- **How to extend:** This is already the primary extensibility mechanism. A game system can be encoded entirely as a library (or library collection) that provides all the base properties. The "Ruleset" slot on new characters is specifically designed for this purpose.
- **Effort:** Low (already functional)
- **Blocks:** Nothing -- this works now. The main limitation is that the computation engine and UI have hardcoded assumptions that libraries alone can't override.
