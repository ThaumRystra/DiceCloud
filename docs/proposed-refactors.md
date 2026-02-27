# Proposed Refactors for Multi-System Extensibility

This document describes prioritized refactoring proposals to make DiceCloud extensible across multiple TTRPG systems while maintaining full backward compatibility with D&D 5e.

---

## Priority Legend

- **P1 Must Have** -- Required for any non-D&D system to function
- **P2 High Value** -- Significantly improves multi-system experience
- **P3 Nice to Have** -- Polish and completeness

---

## Proposed Mod 1: Game System Identifier on Creatures

- **Injection Point:** #20 (Creature Settings), #15 (Default Character Properties)
- **Priority:** P1 Must Have

### Current code
Creatures have a `settings` object and a `type` field (`pc`/`npc`/`monster`), but no concept of which game system they belong to.

### Proposed change
Add a `gameSystem` field to `CreatureSchema` that identifies which rule system this creature uses. This field would be set when the "Ruleset" slot is filled (or manually chosen during character creation).

```typescript
// In Creatures.ts - add to CreatureSchema
gameSystem: {
  type: String,
  optional: true,
  max: 64,
  // Examples: 'dnd5e', 'pf2e', 'bitd', 'coc', 'ironsworn'
},
```

The game system identifier would be informational initially, then gradually used by computation and UI code to branch behavior.

### Why
Every other refactor depends on knowing which system a creature belongs to. Without this, the code has no way to conditionally apply different rules.

### Risk
Very low. This is an additive schema change. Existing creatures would have `gameSystem: undefined`, which the code can treat as `'dnd5e'` by default.

---

## Proposed Mod 2: Configurable Ability Modifier Formula

- **Injection Point:** #1 (Ability Modifier Formula)
- **Priority:** P2 High Value *(was P1; demoted after CoC vibe hack — `attributeType: 'stat'` bypasses cleanly)*

### Current code
```javascript
// computeVariableAsAttribute.js:35-37
if (prop.attributeType === 'ability') {
  prop.modifier = Math.floor((prop.value - 10) / 2);
}
```

### Proposed change
Add an optional `modifierCalculation` field to the attribute schema that overrides the default modifier formula. When present, this calculation is evaluated instead of the hardcoded formula.

```javascript
// computeVariableAsAttribute.js
if (prop.attributeType === 'ability') {
  if (prop.modifierCalculation?.value !== undefined) {
    prop.modifier = prop.modifierCalculation.value;
  } else {
    // Default D&D 5e formula as fallback
    prop.modifier = Math.floor((prop.value - 10) / 2);
  }
}
```

The `modifierCalculation` field would be a `fieldToCompute`, allowing library authors to set arbitrary modifier formulas (e.g., `floor((value - 10) / 2)` for D&D, `floor(value / 2) - 5` for another system, or just `value` for systems where the attribute IS the modifier).

### Why
This is the single most impactful D&D-specific hardcoding. Every non-D&D system has different attribute-to-modifier relationships (or none at all).

### Risk
Low. The default behavior is unchanged. Only attributes that have a `modifierCalculation` set would use it. Existing D&D 5e library rulesets don't set this field, so they get the original formula.

---

## Proposed Mod 3: Configurable Hit Dice Ability Dependency

- **Injection Point:** #2 (Hit Dice Constitution Dependency)
- **Priority:** P3 Nice to Have *(was P2; demoted after CoC vibe hack — graceful degradation confirmed, no hit dice in CoC)*

### Current code
```javascript
// linkTypeDependencies.js:109-112
if (prop.attributeType === 'hitDice') {
  dependencyGraph.addLink(prop._id, 'constitution', 'hitDiceConMod');
}

// computeVariableAsAttribute.js:40-42
if (prop.attributeType === 'hitDice') {
  prop.constitutionMod = computation.scope['constitution']?.modifier || 0;
}
```

### Proposed change
Add an optional `hitDiceAbility` field to the attribute schema. When `attributeType === 'hitDice'`, use this field (defaulting to `'constitution'`) instead of the hardcoded string.

```javascript
// linkTypeDependencies.js
if (prop.attributeType === 'hitDice') {
  const abilityName = prop.hitDiceAbility || 'constitution';
  dependencyGraph.addLink(prop._id, abilityName, 'hitDiceConMod');
}

// computeVariableAsAttribute.js
if (prop.attributeType === 'hitDice') {
  const abilityName = prop.hitDiceAbility || 'constitution';
  prop.constitutionMod = computation.scope[abilityName]?.modifier || 0;
}
```

### Why
Some systems don't link hit points to Constitution. Making this configurable allows system libraries to specify the relevant ability.

### Risk
Very low. Default behavior preserved. Only affects properties that set `hitDiceAbility`.

---

## Proposed Mod 4: Data-Driven Damage Types

- **Injection Point:** #6 (Damage Types List)
- **Priority:** P2 High Value *(was P1; demoted after CoC vibe hack — not a blocker for CoC or most narrative systems)*

### Current code
```javascript
// DAMAGE_TYPES.js
const DAMAGE_TYPES = Object.freeze([
  'healing', 'bludgeoning', 'piercing', 'slashing', 'acid', 'cold',
  'fire', 'force', 'lightning', 'necrotic', 'poison', 'psychic',
  'radiant', 'thunder', 'extra',
]);
```

### Proposed change
Keep the current list as the default but make it extensible. Create a `GameSystemConfig` pattern where system-specific configurations can override or extend the damage types.

```javascript
// DAMAGE_TYPES.js
const DEFAULT_DAMAGE_TYPES = Object.freeze([
  'healing', 'bludgeoning', 'piercing', 'slashing', 'acid', 'cold',
  'fire', 'force', 'lightning', 'necrotic', 'poison', 'psychic',
  'radiant', 'thunder', 'extra',
]);

// Allow the damage multiplier UI to accept any string, not just these
export default DEFAULT_DAMAGE_TYPES;
```

The key change: the `DamageMultiplier` schema should accept any string for damage type (which it already does in the `damageTypes` array field), and the UI dropdown should show the default list but allow custom entries. The `DAMAGE_TYPES` constant should be used as suggestions, not as a hard constraint.

### Why
Different systems have completely different damage taxonomies. Pathfinder 2e has more types; Blades in the Dark has harm levels instead.

### Risk
Very low. The damage type system already stores arbitrary strings; this just makes the UI accept custom values.

---

## Proposed Mod 5: Extensible Compute-By-Type and Link-Dependencies Registries

- **Injection Point:** #16 (Compute By Type Registry), #17 (Link Dependencies By Type)
- **Priority:** P2 High Value *(was P1; demoted after CoC vibe hack — existing compute handlers sufficient for CoC, no custom property types needed yet)*

### Current code
```javascript
// computeByType.js
export default Object.freeze({
  _variable,
  _calculation,
  action,
  attribute,
  container,
  skill,
  pointBuy,
  propertySlot,
  spell: action,
  spellList,
  toggle,
  trigger,
});

// linkTypeDependencies.js
const linkDependenciesByType = {
  action: linkAction,
  adjustment: linkAdjustment,
  attribute: linkAttribute,
  // ... etc
}
```

### Proposed change
Convert these from frozen static objects to registries that allow new entries to be added.

```javascript
// computeByType.js
const computeByType = {
  _variable,
  _calculation,
  action,
  attribute,
  // ... existing entries
};

export function registerComputeHandler(type, handler) {
  computeByType[type] = handler;
}

export default computeByType;
```

```javascript
// linkTypeDependencies.js
export function registerLinkDependencies(type, handler) {
  linkDependenciesByType[type] = handler;
}
```

### Why
Custom property types need to register their own computation and dependency-linking logic. Without this, adding new property types requires modifying core engine files.

### Risk
Low. Registration is additive. Existing types continue to work as before.

---

## Proposed Mod 6: Configurable Proficiency Variable Name

- **Injection Point:** #3 (Proficiency Bonus Reference)
- **Priority:** P3 Nice to Have *(was P2; demoted after CoC vibe hack — optional chaining `?.value || 0` degrades gracefully to 0)*

### Current code
Multiple files hardcode `'proficiencyBonus'` as the variable name:
```javascript
computation.scope['proficiencyBonus']?.value || 0
dependencyGraph.addLink(prop._id, 'proficiencyBonus', 'skillProficiencyBonus');
```

### Proposed change
Instead of hardcoding, look up the proficiency variable name from the creature's game system config or from a constant that can be overridden:

```javascript
// In a new file: app/imports/api/engine/shared/systemConstants.js
export const SYSTEM_CONSTANTS = {
  proficiencyVariable: 'proficiencyBonus',
};

// Usage in computation files:
import { SYSTEM_CONSTANTS } from '/imports/api/engine/shared/systemConstants';
const profBonus = computation.scope[SYSTEM_CONSTANTS.proficiencyVariable]?.value || 0;
```

For full multi-system support, this could later be resolved from the creature's `gameSystem` field.

### Why
Not all systems have a proficiency bonus. Some have a level-based bonus with a different name. Making this configurable unblocks Pathfinder 2e and other systems.

### Risk
Low. This is a refactor to use a constant instead of a magic string. The default value remains `'proficiencyBonus'`.

---

## Proposed Mod 7: Extensible Rest Types

- **Injection Point:** #13 (Rest System)
- **Priority:** P2 High Value

### Current code
```javascript
// applyResetTask.ts
switch (task.eventName) {
  case 'shortRest': /* ... */ break;
  case 'longRest': /* ... */ break;
}

if (task.eventName === 'longRest') {
  // Long rests reset short rest properties
  mongoFilter = { reset: { $in: ['shortRest', 'longRest'] } }
  // Special hit dice recovery
  await resetHitDice(task, action, result, userInput);
}
```

### Proposed change
Make the rest hierarchy and special behaviors data-driven:

```javascript
// System-configurable rest definitions
const REST_HIERARCHY = {
  dnd5e: {
    longRest: {
      includes: ['shortRest'],
      special: ['resetHitDice'],
    },
    shortRest: {
      includes: [],
      special: [],
    },
  },
};
```

The existing `reset` field on attributes already supports arbitrary event names. The main change is making the `applyResetTask.ts` code look up rest hierarchy from config rather than hardcoding `longRest` includes `shortRest`.

### Why
Different systems have different rest mechanics. Pathfinder 2e has different rest rules; Blades in the Dark has downtime instead of rests.

### Risk
Medium. The rest system is user-facing and well-established. Changes need careful testing.

---

## Proposed Mod 8: Data-Driven Character Sheet Tabs

- **Injection Point:** #11 (Character Sheet Tabs), #12 (Stats Tab Layout)
- **Priority:** P1 Must Have *(was P2; promoted after CoC vibe hack — Stats Tab empty D&D sections are the #1 UX blocker)*

### Current code
```html
<!-- CharacterSheet.vue -->
<v-tab-item><stats-tab /></v-tab-item>
<v-tab-item><actions-tab /></v-tab-item>
<v-tab-item v-if="!creature.settings.hideSpellsTab"><spells-tab /></v-tab-item>
<!-- ... 5 more hardcoded tabs -->
```

### Proposed change
Define tab configuration as data that can be overridden by game system config:

```javascript
const DEFAULT_TABS = [
  { id: 'stats', name: 'Stats', component: 'StatsTab', icon: 'mdi-chart-box', alwaysShow: true },
  { id: 'actions', name: 'Actions', component: 'ActionsTab', icon: 'mdi-lightning-bolt', alwaysShow: true },
  { id: 'spells', name: 'Spells', component: 'SpellsTab', icon: 'mdi-fire', hideSetting: 'hideSpellsTab' },
  { id: 'inventory', name: 'Inventory', component: 'InventoryTab', icon: 'mdi-cube', alwaysShow: true },
  { id: 'features', name: 'Features', component: 'FeaturesTab', icon: 'mdi-text', alwaysShow: true },
  { id: 'journal', name: 'Journal', component: 'JournalTab', icon: 'mdi-book-open-variant', alwaysShow: true },
  { id: 'build', name: 'Build', component: 'BuildTab', icon: 'mdi-wrench', alwaysShow: true },
  { id: 'tree', name: 'Tree', component: 'TreeTab', icon: 'mdi-file-tree', showSetting: 'showTreeTab' },
];
```

Then iterate over tab config in `CharacterSheet.vue` using `v-for`.

### Why
Different game systems need different tab layouts. Blades in the Dark would need Playbook/Crew tabs; Call of Cthulhu would need Investigation/Sanity tabs.

### Risk
Medium. This is a UI refactor that touches the main character sheet component. Needs thorough visual testing.

---

## Proposed Mod 9: Property Type Registration Pattern

- **Injection Point:** #7 (Property Types Registry), #23 (Property Form Components), #24 (Property Viewer Components)
- **Priority:** P2 High Value *(was P1; demoted after CoC vibe hack — existing property types sufficient, only needed for novel types like Blades in the Dark Clocks)*

### Current code
Property types are registered across 5+ files:
1. `PROPERTIES.js` -- metadata
2. `propertySchemasIndex.js` -- base schemas
3. `computedPropertySchemasIndex.js` -- computed schemas
4. `computedOnlyPropertySchemasIndex.js` -- computed-only schemas
5. `propertyFormIndex.js` -- UI forms
6. `propertyViewerIndex.js` -- UI viewers

### Proposed change
Create a unified registration function:

```javascript
// app/imports/api/properties/propertyRegistry.js
const registry = {};

export function registerPropertyType(type, config) {
  registry[type] = {
    schema: config.schema,
    computedSchema: config.computedSchema,
    computedOnlySchema: config.computedOnlySchema,
    metadata: config.metadata, // icon, name, helpText, suggestedParents
    formComponent: config.formComponent,
    viewerComponent: config.viewerComponent,
    computeHandler: config.computeHandler,
    linkDependencies: config.linkDependencies,
  };
}

export function getPropertyTypes() {
  return registry;
}
```

All existing property types would be registered via this function at app startup. New game system modules could register additional types.

### Why
This is the backbone of extensibility. Currently adding a new property type requires editing 6+ files. A registration pattern reduces it to a single call.

### Risk
Medium-high. This touches many files and the schema attachment logic. Implement carefully, maintaining the existing `attachSchema(schema, { selector: { type } })` pattern.

---

## Proposed Mod 10: Game System Library Packs

- **Injection Point:** #25 (Library System)
- **Priority:** P1 Must Have (but already partially functional)

### Current code
Libraries already work as extensibility mechanism. New characters get a "Ruleset" slot tagged `base` that can be filled from any subscribed library.

### Proposed change
Formalize the concept of "game system library packs":

1. Add a `gameSystem` field to `LibrarySchema`:
```javascript
gameSystem: {
  type: String,
  optional: true,
  max: 64,
}
```

2. When a base ruleset library is applied via the slot system, copy the library's `gameSystem` to the creature's `gameSystem` field.

3. In the library market UI, allow filtering by game system.

### Why
This connects the library system (which already works for content delivery) to the game system concept, making it easy to discover and apply complete game system packs.

### Risk
Very low. Additive field on library schema; the slot-filling mechanism already works.

---

## Implementation Order

> **Revised 2026-02-27** after CoC 7e vibe hack. See "Vibe Hack Validation" section below.

### Phase 1: Foundation (Low Risk)
1. **Mod 1:** Add `gameSystem` field to creatures
2. **Mod 10:** Add `gameSystem` to libraries

### Phase 2: UI (Medium Risk — now highest priority after vibe hack)
3. **Mod 8:** Data-driven character sheet tabs *(P1 — promoted)*

### Phase 3: Computation (Medium Risk)
4. **Mod 2:** Configurable ability modifier formula
5. **Mod 4:** Make damage types extensible
6. **Mod 5:** Extensible compute registries
7. **Mod 9:** Property type registration pattern
8. **Mod 7:** Extensible rest types

### Phase 4: Polish (Low Risk)
9. **Mod 3:** Configurable hit dice ability
10. **Mod 6:** Configurable proficiency variable

---

## Vibe Hack Validation

**Test:** Call of Cthulhu 7e investigator built using Library system only, no code changes.
**Date:** 2026-02-27
**Artifact:** `docs/vibe-hack-coc-results.md`, `scripts/insert-coc7e-library.js`

This section records priority changes driven by empirical testing rather than theory.

### Promoted

| Mod | Original | Revised | Rationale |
|-----|----------|---------|-----------|
| 8 (Data-driven tabs) | P2 | **P1** | Stats Tab shows empty D&D sections (Ability Scores, Hit Dice, Spell Slots, Saves, Proficiencies) for CoC characters. This is the single biggest visual blocker. No workaround available via library or settings. |

### Demoted

| Mod | Original | Revised | Rationale |
|-----|----------|---------|-----------|
| 2 (Ability modifier formula) | P1 | **P2** | `attributeType: 'stat'` skips the D&D `(score-10)/2` formula entirely. CoC characteristics display raw values with no modifier computed. Not a blocker unless you need the modifier display with a different formula. |
| 4 (Damage types) | P1 | **P2** | CoC doesn't use typed damage. Damage Multipliers section is simply empty. No blocker for narrative systems. Only becomes relevant for Pathfinder 2e (more types) or GURPS. |
| 5 (Extensible compute registries) | P1 | **P2** | All CoC properties (stat, resource, healthBar, skill, action, roll, branch, note) use existing compute handlers. No novel compute logic needed. Only required if a new system needs a fundamentally new property type like a BitD Clock. |
| 9 (Property type registration) | P1 | **P2** | Same rationale as Mod 5. Existing types sufficient for CoC. Demote until a system needs a new type. |
| 3 (Hit dice ability) | P2 | **P3** | CoC has no hit dice. Hit dice sections display empty but don't error. Graceful degradation confirmed. |
| 6 (Proficiency variable name) | P2 | **P3** | `computation.scope['proficiencyBonus']?.value \|\| 0` optional chaining means absent proficiency bonus silently becomes 0 throughout. Zero proficiency is exactly correct for CoC. |

### Key Findings (Summary)

- **80% of injection points are non-blocking** for CoC (20/25). Library system handles far more than expected.
- **`attributeType: 'stat'`** is the critical bypass: it skips ability modifier computation entirely, making non-D20 stats work cleanly.
- **Optional chaining `?.value \|\| 0`** throughout computation code provides silent graceful degradation for absent variables.
- **Parser is more capable than documented**: floor(), nested ternary, dice in ternary branches, &&/||, all work.
- **The Stats Tab is the only real code blocker** — it renders D&D-specific sections regardless of game system.
