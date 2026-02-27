# CLAUDE.md -- DiceCloud Multi-System Extensibility Project

## 1. Project Overview

**DiceCloud** is a free, auditable, real-time character sheet web application originally built for D&D 5e. It tracks where every number comes from and automatically recalculates stats when equipment, buffs, or abilities change.

**This fork's goal:** Make DiceCloud extensible to support multiple TTRPG systems (Pathfinder 2e, Call of Cthulhu, Blades in the Dark, Ironsworn, etc.) by identifying rule injection points, documenting the architecture, and proposing lightweight refactors.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Meteor.js 2.x (full-stack) |
| Database | MongoDB |
| Client UI | Vue.js 2 + Vuetify 2 (Material Design) |
| Reactivity | Vue-Meteor-Tracker (bridges Meteor's reactive data into Vue) |
| State | Vuex (UI state: tabs, dialogs, drawer) |
| Routing | Vue Router |
| Schema | simpl-schema (SimpleSchema) |
| Parser | Nearley.js (PEG grammar) + Moo.js (lexer) |
| Dep Graph | ngraph.graph + ngraph.path |
| File Storage | S3 via Slingshot |
| Deploy | Docker Compose |

---

## 2. Architecture Summary

See [docs/architecture.md](docs/architecture.md) for diagrams and detailed data flow.

### Core Concepts

**Property Tree:** Every character feature is a node in a tree. Ability scores, skills, spells, items, effects, actions -- all stored as `CreatureProperty` documents with `type`, `parentId`, and nested set indices (`left`/`right`).

**Effect System:** Effects modify other properties via operations (`add`, `mul`, `base`, `set`, `min`, `max`, `advantage`, `disadvantage`, etc.). They target by variable name or by tag-based matching.

**Computation Engine:** A three-phase server-side pipeline:
1. **Build** -- fetch properties, parse formulas, construct dependency graph
2. **Compute** -- depth-first traversal computing each node after its dependencies
3. **Write** -- diff computed vs. original, batch-update changed properties to MongoDB

**Library System:** Reusable property templates shared between users. Characters have a "Ruleset" slot that can be filled from a library, making this the primary extensibility mechanism for adding new game systems.

### Data Flow

```
User edits property → Meteor method → MongoDB write → creature marked dirty
→ Server recomputes → dependency graph traversal → computed values written
→ Reactive publication pushes updates → Vue UI updates automatically
```

---

## 3. Development Setup

### Prerequisites
- [Git](https://git-scm.com/)
- [Meteor](https://www.meteor.com/install)

### Running Locally

```bash
cd app
meteor npm install
meteor run --settings exampleMeteorSettings.json
```

App runs at `http://localhost:3000/`. The example settings file disables Patreon restrictions.

### Running with Docker Compose

```bash
docker-compose up --build
```

This starts MongoDB and the app. Patreon is disabled by default in the Docker config.

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `ROOT_URL` | Public URL of the app |
| `MONGO_URL` | MongoDB connection string |
| `MONGO_OPLOG_URL` | MongoDB oplog URL (for real-time reactivity) |
| `MAIL_URL` | SMTP URL for email sending |
| `METEOR_SETTINGS` | JSON config (see below) |
| `DEFAULT_LIBRARIES` | Comma-separated library IDs subscribed by default |

### Disabling Patreon

Set `"disablePatreon": true` in the `public` key of `METEOR_SETTINGS`:

```json
{
  "public": {
    "environment": "production",
    "disablePatreon": true
  }
}
```

Or use `meteor run --settings exampleMeteorSettings.json`.

---

## 4. Key Files & Their Roles

### Directory Tree

```
app/
├── client/main.js                         # Client entry point
├── server/main.js                         # Server entry point
├── imports/
│   ├── api/                               # Data models, business logic
│   │   ├── creature/
│   │   │   ├── creatures/
│   │   │   │   ├── Creatures.ts           # ★ Creature collection + schema
│   │   │   │   ├── CreatureVariables.ts   # Computed variable scope
│   │   │   │   └── defaultCharacterProperties.js  # ★ Default properties for new chars
│   │   │   ├── creatureProperties/
│   │   │   │   └── CreatureProperties.ts  # ★ CreatureProperty collection (polymorphic)
│   │   │   ├── experience/                # XP tracking
│   │   │   ├── log/                       # Activity logging
│   │   │   └── archive/                   # Character export/import
│   │   ├── engine/
│   │   │   ├── computeCreature.ts         # ★ Main computation entry point
│   │   │   ├── computation/
│   │   │   │   ├── buildCreatureComputation.ts    # ★ Phase 1: build dep graph
│   │   │   │   ├── computeCreatureComputation.ts  # ★ Phase 2: traverse + compute
│   │   │   │   ├── CreatureComputation.ts         # Computation state class
│   │   │   │   ├── buildComputation/
│   │   │   │   │   ├── linkTypeDependencies.js    # ★ Type-specific dep linking
│   │   │   │   │   ├── linkCalculationDependencies.js
│   │   │   │   │   └── parseCalculationFields.js
│   │   │   │   ├── computeComputation/
│   │   │   │   │   ├── computeByType.js           # ★ Compute dispatch registry
│   │   │   │   │   ├── computeToggles.js
│   │   │   │   │   └── computeByType/
│   │   │   │   │       ├── computeVariable.js             # Variable aggregation dispatcher
│   │   │   │   │       ├── computeVariable/
│   │   │   │   │       │   ├── computeVariableAsAttribute.js  # ★ D&D ability mod formula
│   │   │   │   │       │   ├── computeVariableAsSkill.js      # ★ Skill computation
│   │   │   │   │       │   ├── computeVariableAsClass.js
│   │   │   │   │       │   ├── computeImplicitVariable.js
│   │   │   │   │       │   ├── getAggregatorResult.js         # Effect aggregation math
│   │   │   │   │       │   └── aggregate/
│   │   │   │   │       │       ├── aggregateEffect.js         # ★ Effect aggregation
│   │   │   │   │       │       ├── aggregateDefinition.js
│   │   │   │   │       │       └── aggregateProficiency.js
│   │   │   │   │       ├── computeCalculation.js              # ★ Formula evaluation
│   │   │   │   │       ├── computeSkill.js                    # Skill w/o variable name
│   │   │   │   │       └── computeAttribute.js                # Attribute w/o variable name
│   │   │   │   └── writeComputation/
│   │   │   │       ├── writeAlteredProperties.ts
│   │   │   │       └── writeScope.ts
│   │   │   └── action/
│   │   │       ├── tasks/
│   │   │       │   ├── applyResetTask.ts          # ★ Rest system (short/long)
│   │   │       │   └── applyDamagePropTask.ts
│   │   │       └── applyProperties/               # Property type applicators
│   │   ├── library/
│   │   │   ├── Libraries.js               # ★ Library collection
│   │   │   ├── LibraryNodes.ts            # ★ Library node collection
│   │   │   └── LibraryCollections.js      # Library bundles
│   │   ├── properties/
│   │   │   ├── propertySchemasIndex.js            # ★ Base schema registry
│   │   │   ├── computedPropertySchemasIndex.js    # Computed schema registry
│   │   │   ├── computedOnlyPropertySchemasIndex.js
│   │   │   ├── PropertyType.type.ts               # TypeScript type definition
│   │   │   ├── Attributes.ts              # ★ Attribute schema (ability, hitDice, etc.)
│   │   │   ├── Skills.ts                  # ★ Skill schema (skill, save, check, etc.)
│   │   │   ├── Effects.ts                 # ★ Effect schema (operations enum)
│   │   │   ├── Actions.ts                 # Action schema
│   │   │   ├── Spells.ts                  # Spell schema
│   │   │   ├── SpellLists.ts              # Spell list schema
│   │   │   └── ... (28 more type files)
│   │   ├── parenting/
│   │   │   ├── ChildSchema.ts             # Tree structure (root, parentId, left, right)
│   │   │   └── SoftRemovableSchema.ts     # Soft delete
│   │   ├── sharing/
│   │   │   └── SharingSchema.ts           # Owner/readers/writers
│   │   └── users/
│   │       └── patreon/tiers.js           # Patreon tier logic
│   ├── client/ui/
│   │   ├── vueSetup.js                    # Vue + Vuetify + Router setup
│   │   ├── creature/character/
│   │   │   ├── CharacterSheet.vue         # ★ Main character sheet (tabs)
│   │   │   └── characterSheetTabs/
│   │   │       ├── StatsTab.vue           # ★ Stats display (D&D layout)
│   │   │       ├── ActionsTab.vue
│   │   │       ├── SpellsTab.vue
│   │   │       ├── InventoryTab.vue
│   │   │       ├── FeaturesTab.vue
│   │   │       ├── JournalTab.vue
│   │   │       ├── BuildTab.vue
│   │   │       └── TreeTab.vue
│   │   ├── properties/
│   │   │   ├── forms/shared/propertyFormIndex.js   # ★ Type → form component map
│   │   │   ├── viewers/shared/propertyViewerIndex.js  # Type → viewer map
│   │   │   └── components/                # Display components by feature
│   │   └── library/                       # Library browser UI
│   ├── constants/
│   │   ├── PROPERTIES.js                  # ★ Property type metadata registry
│   │   ├── DAMAGE_TYPES.js                # ★ D&D damage types
│   │   ├── BUILT_IN_TAGS.js               # Built-in tags
│   │   └── RESERVED_VARIABLE_NAMES.js     # Reserved variable names
│   └── parser/
│       ├── parser.ts                      # Nearley parser wrapper
│       ├── grammar.ne                     # PEG grammar definition
│       ├── resolve.ts                     # Expression resolution engine
│       └── parseTree/                     # Parse tree node types
├── exampleMeteorSettings.json             # Dev settings (Patreon disabled)
└── package.json                           # Dependencies
```

**★ = High-importance files for extensibility work**

### When to Edit Each File

| Goal | File(s) to Edit |
|------|-----------------|
| Add a new property type | `propertySchemasIndex.js`, `PROPERTIES.js`, new schema in `properties/`, new form/viewer in `client/ui/properties/`, add to `computeByType.js` and `linkTypeDependencies.js` if custom compute needed |
| Change how abilities compute modifiers | `computeVariableAsAttribute.js` |
| Change how skills compute | `computeVariableAsSkill.js` or `computeSkill.js` |
| Modify effect operations | `Effects.ts` (schema), `aggregateEffect.js` (aggregation), `getAggregatorResult.js` (resolution) |
| Change rest behavior | `applyResetTask.ts` |
| Modify default new character | `defaultCharacterProperties.js` |
| Add character sheet tab | `CharacterSheet.vue` |
| Modify damage types | `DAMAGE_TYPES.js` |
| Change parser/formula syntax | `grammar.ne`, rebuild with Nearley |

---

## 5. The Rule Injection Point Map

See [docs/injection-points.md](docs/injection-points.md) for the full catalog.

### Quick Reference

| Category | Key Injection Points | Effort |
|----------|---------------------|--------|
| **Calculation** | Ability modifier formula, proficiency bonus, skill computation, hit dice dependency | Low-Medium |
| **Config** | Damage types, property types registry, default character props, reserved variables | Low |
| **Schema** | Attribute types enum, skill types enum, effect operations, spell properties | Low-Medium |
| **UI** | Character sheet tabs, stats tab layout, property form/viewer components | Medium |
| **Library** | Library system (already extensible via Ruleset slot pattern) | Low |

### What the Library System Already Handles

The library system can handle ~80% of multi-system extensibility without any code changes:
- All base stats, skills, and saves (as attribute/skill properties in a library)
- Class/level structures
- Spell systems (via spell lists and spell properties)
- Items and equipment
- Custom formulas (via the expression parser)
- Buffs, effects, and modifiers

### What Requires Code Changes

The remaining ~20% that needs code changes:
- Ability modifier formula (hardcoded `(score - 10) / 2`)
- Hit dice dependency on Constitution
- Proficiency bonus variable name
- Passive skill advantage bonus (+/-5)
- Character sheet tab layout
- Damage type dropdown options

---

## 6. How to Add a New Game System (Future Guide)

### Step 1: Create Base Ruleset Library
Create a library tagged `base` containing all foundational properties:
- Ability scores / attributes (as `attribute` type with `attributeType: 'ability'`)
- Skills (as `skill` type)
- Base stats (AC, HP, speed, etc.)
- Proficiency or equivalent bonus

### Step 2: Fill the Slot
New characters come with a "Ruleset" slot (`slotTags: ['base']`). Your library nodes should have `fillSlots: true` and `libraryTags: ['base']`.

### Step 3: Create Content Libraries
Build additional libraries for:
- Classes / playbooks / archetypes
- Spells / powers / abilities
- Equipment / items
- Feats / edges / talents

### Step 4: Code Changes (If Needed)
If your system differs from D&D 5e in computation:

1. **Different modifier formula:** Currently requires editing `computeVariableAsAttribute.js`. After Proposed Mod 2, could be done via library.
2. **No proficiency bonus:** Hide via creature settings; skills still compute correctly with proficiency = 0.
3. **Different damage types:** After Proposed Mod 4, custom damage types work in UI.
4. **Custom property types:** After Proposed Mod 9, register via `registerPropertyType()`.
5. **Different rest system:** After Proposed Mod 7, configure rest hierarchy.

### What Works Today Without Code Changes
- Custom stats and skills (any name, any formula)
- Custom classes and levels
- Items, containers, equipment
- Actions with custom resource costs
- Buffs and effects targeting any stat
- Toggle-based conditions
- Branching logic (if/then conditions)
- Custom dice formulas (the parser handles any dice notation)

---

## 7. Proposed Refactors (Backlog)

See [docs/proposed-refactors.md](docs/proposed-refactors.md) for detailed before/after proposals.

### Priority P1 -- Must Have

| # | Refactor | Risk |
|---|----------|------|
| 1 | Add `gameSystem` field to creatures | Very Low |
| 4 | Make damage types extensible | Very Low |
| 10 | Add `gameSystem` to libraries | Very Low |
| 2 | Configurable ability modifier formula | Low |
| 5 | Extensible compute/link registries | Low |
| 9 | Property type registration pattern | Medium |

### Priority P2 -- High Value

| # | Refactor | Risk |
|---|----------|------|
| 3 | Configurable hit dice ability | Very Low |
| 6 | Configurable proficiency variable name | Low |
| 7 | Extensible rest types | Medium |
| 8 | Data-driven character sheet tabs | Medium |

### Priority P3 -- Nice to Have

| # | Refactor | Risk |
|---|----------|------|
| - | Extensible attribute type enum | Low |
| - | Extensible skill type enum | Low |
| - | Extensible action type enum | Low |

---

## 8. Conventions & Gotchas

### Meteor-Specific Patterns

- **Validated Methods:** All mutations use `mdg:validated-method` with `simpl-schema` validation and rate limiting
- **Publications/Subscriptions:** Data is pushed to clients via Meteor publications; clients subscribe and get reactive updates
- **Vue-Meteor-Tracker:** The `meteor` option on Vue components runs reactive computations that automatically re-run when underlying MongoDB data changes
- **EJSON:** Used for deep cloning (4x faster than lodash `cloneDeep` for EJSON-compatible objects)
- **`this.unblock()`:** Called in methods that don't need serial execution to allow concurrent method calls

### MongoDB Conventions

- **Nested Set Model:** All tree structures (properties, library nodes) use `left`/`right` integer fields for efficient ancestor/descendant queries
- **Soft Delete:** Properties use `removed`/`removedAt`/`removedWith` fields rather than hard deletion
- **Polymorphic Collections:** `creatureProperties` and `libraryNodes` store 28+ different types in one collection, with type-specific schemas attached via `attachSchema(schema, { selector: { type } })`
- **Denormalization:** Computed values stored directly on documents (e.g., `denormalizedStats.xp` on creatures)
- **Root Reference:** Every property has `root: { id, collection }` pointing back to its owning creature or library

### Reactive Computation Gotchas

- **Computation runs server-side only:** `computeCreature()` returns early on client (`if (Meteor.isClient) return`)
- **Dirty flag:** Properties set `dirty: true` when changed; the server watches for dirty creatures and recomputes them
- **Dependency loops:** The engine detects cycles in the dependency graph and reports them as errors rather than infinite-looping
- **Max property count:** Creatures with >1000 properties generate a warning

### Known Technical Debt

- **Typo in code:** `computeVariableAsSkill.js:80` has `prop.bassiveBonus` (should be `passiveBonus`) -- this is a dead code path since the correct field is set earlier
- **Frozen compute registry:** `computeByType.js` uses `Object.freeze()`, which prevents extending the registry without modifying the source
- **Magic number 0.49:** Used for "half proficiency rounded down" throughout computation code; should be a named constant
- **Hardcoded `'constitution'` string:** In `linkTypeDependencies.js` and `computeVariableAsAttribute.js` for hit dice dependency
- **Hardcoded `'proficiencyBonus'` string:** In 5+ computation files for skill/calculation proficiency lookups
