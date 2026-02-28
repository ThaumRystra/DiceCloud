/**
 * The Expanse RPG — Sample Character: Jadamantha Holland
 *
 * Belter Negotiator, Level 1
 * Demonstrates a fully filled-in Expanse character with pre-set ability scores.
 *
 * Expected computed values (verify after running):
 *   Toughness = 10 + Constitution(1) = 11
 *   Defense   = 10 + Dexterity(1)   = 11
 *   Speed     = 10 + Dexterity(1) + Perception(2) = 13
 *   Fortune   = 10 + Level(1)×2 + Constitution(1) = 13
 *
 * Usage:
 *   cd app
 *   meteor shell
 *   > .load ../scripts/create-expanse-sample-character.js
 *
 * IMPORTANT: Run insert-expanse-library.js first to create the base library,
 * then fill the Ruleset slot from the UI. This script creates the creature shell
 * and overrides ability scores via effects. For a production workflow, you would
 * create the creature in the UI and fill slots; this script demonstrates the
 * data shape for testing purposes.
 */

// ============================================================================
// Imports
// ============================================================================

const { Meteor } = require('meteor/meteor');
const { Random } = require('meteor/random');

const Creatures = require('/imports/api/creature/creatures/Creatures').default
  || require('/imports/api/creature/creatures/Creatures').Creatures;
const CreatureProperties = require('/imports/api/creature/creatureProperties/CreatureProperties').default
  || require('/imports/api/creature/creatureProperties/CreatureProperties').CreatureProperties;

// ============================================================================
// Helpers
// ============================================================================

function getOwnerId() {
  const user = Meteor.users.findOne({}, { fields: { _id: 1 } });
  if (!user) throw new Error('No users found. Create an account first.');
  console.log(`Using owner: ${user._id}`);
  return user._id;
}

function id() {
  return Random.id();
}

// ============================================================================
// Main
// ============================================================================

(function createJadamanthaHolland() {
  const ownerId = getOwnerId();
  const creatureId = id();

  // --------------------------------------------------------------------------
  // 1. Create the Creature document
  // --------------------------------------------------------------------------
  Creatures.insert({
    _id: creatureId,
    name: 'Jadamantha Holland',
    alignment: 'Neutral',
    gender: 'Non-binary',
    owner: ownerId,
    readers: [],
    writers: [],
    public: false,
    type: 'pc',
    gameSystem: 'expanse',
    settings: {
      hideRestButtons: true,
      hideSpellsTab: true,
      showTreeTab: false,
      hideUnusedStats: false,
    },
    dirty: true,
  });

  console.log(`Created creature: ${creatureId} — "Jadamantha Holland"`);

  const creatureRef = { id: creatureId, collection: 'creatures' };
  let nodeCounter = 100; // start high to avoid conflicts

  const allProps = [];

  function makeProp(overrides) {
    const propId = overrides._id || id();
    nodeCounter++;
    const prop = {
      _id: propId,
      root: creatureRef,
      tags: [],
      left: nodeCounter * 2 - 1,
      right: nodeCounter * 2,
      removed: false,
      ...overrides,
    };
    allProps.push(prop);
    return propId;
  }

  // --------------------------------------------------------------------------
  // 2. Root folder (everything lives under this)
  // --------------------------------------------------------------------------
  const rootFolderId = makeProp({
    type: 'folder',
    name: 'Jadamantha Holland',
    parentId: undefined,
  });

  // --------------------------------------------------------------------------
  // 3. Ability scores as override effects
  //    (In a real game, these would be set on the library node base values;
  //     here we use effects to override for testing without library dependency)
  // --------------------------------------------------------------------------
  const abilities = [
    { variableName: 'accuracy',      value: 0,  name: 'Accuracy' },
    { variableName: 'communication', value: 3,  name: 'Communication' },
    { variableName: 'constitution',  value: 1,  name: 'Constitution' },
    { variableName: 'dexterity',     value: 1,  name: 'Dexterity' },
    { variableName: 'fighting',      value: 0,  name: 'Fighting' },
    { variableName: 'intelligence',  value: 2,  name: 'Intelligence' },
    { variableName: 'perception',    value: 2,  name: 'Perception' },
    { variableName: 'strength',      value: 0,  name: 'Strength' },
    { variableName: 'willpower',     value: 1,  name: 'Willpower' },
  ];

  for (const ability of abilities) {
    makeProp({
      type: 'attribute',
      attributeType: 'stat',
      variableName: ability.variableName,
      name: ability.name,
      baseValue: { calculation: String(ability.value) },
      decimal: false,
      parentId: rootFolderId,
    });
  }

  console.log(`Created ${abilities.length} ability score stats`);

  // --------------------------------------------------------------------------
  // 4. Derived stats (auto-computed from abilities above)
  // --------------------------------------------------------------------------
  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'level',
    name: 'Level',
    baseValue: { calculation: '1' },
    decimal: false,
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'toughness',
    name: 'Toughness',
    baseValue: { calculation: '10 + constitution' },
    decimal: false,
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'defense',
    name: 'Defense',
    baseValue: { calculation: '10 + dexterity' },
    decimal: false,
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'speed',
    name: 'Speed',
    baseValue: { calculation: '10 + dexterity + perception' },
    decimal: false,
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'healthBar',
    variableName: 'fortune',
    name: 'Fortune',
    baseValue: { calculation: '10 + level * 2 + constitution' },
    decimal: false,
    parentId: rootFolderId,
  });

  console.log('Created Level, Toughness, Defense, Speed, Fortune');

  // --------------------------------------------------------------------------
  // 5. Focuses
  // --------------------------------------------------------------------------
  const focuses = [
    { variableName: 'focusBargaining', name: 'Bargaining',  ability: 'communication', bonus: 2 },
    { variableName: 'focusTechnology', name: 'Technology',  ability: 'intelligence',  bonus: 2 },
    { variableName: 'focusFreeFall',   name: 'Free-fall',   ability: 'dexterity',     bonus: 2 },
  ];

  for (const focus of focuses) {
    makeProp({
      type: 'skill',
      skillType: 'skill',
      variableName: focus.variableName,
      name: focus.name,
      ability: focus.ability,
      baseProficiency: 1,
      baseValue: { calculation: '2' },
      parentId: rootFolderId,
    });
  }

  console.log(`Created ${focuses.length} Focuses`);

  // --------------------------------------------------------------------------
  // 6. Character background note
  // --------------------------------------------------------------------------
  makeProp({
    type: 'note',
    name: 'Background: Jadamantha Holland',
    description: { text: `Jadamantha Holland — Belter Negotiator, Level 1

Background: Born on Tycho Station, Jadamantha grew up brokering deals between OPA factions and Belt corporations. They learned early that words could move freight more efficiently than guns.

Occupation: Independent Trade Negotiator
Drive: Inyalowda fo da belt (Belt solidarity — "we are not your tools")

Focuses:
• Bargaining (Communication 3 + 2 = 5) — Their primary skill
• Technology (Intelligence 2 + 2 = 4) — Understands ship systems enough to negotiate contracts
• Free-fall (Dexterity 1 + 2 = 3) — Raised in low-g, moves naturally in microgravity

Derived Stats:
• Toughness: 11 (10 + CON 1)
• Defense: 11 (10 + DEX 1)
• Speed: 13 (10 + DEX 1 + PER 2)
• Fortune: 13 (10 + Level 1×2 + CON 1)

Talents (add via library or custom notes):
• Inspire (Communication) — Spend SP to give allies bonus
• Contacts — Has connections throughout the Belt
[Add talents using the Features tab]

Equipment (add via Inventory tab):
• Personal comm unit
• Light environment suit (well-worn)
• Encrypted datapad with trade manifests
• 200 credits`,
    },
    parentId: rootFolderId,
  });

  // --------------------------------------------------------------------------
  // 7. Insert all properties
  // --------------------------------------------------------------------------
  console.log(`\nInserting ${allProps.length} creature properties...`);

  for (const prop of allProps) {
    try {
      CreatureProperties.insert(prop);
    } catch (e) {
      console.error(`Failed to insert prop "${prop.name}" (${prop.type}):`, e.message);
    }
  }

  // Rebuild nested sets
  try {
    const { rebuildNestedSets } = require('/imports/api/parenting/parentingFunctions');
    if (rebuildNestedSets) {
      rebuildNestedSets(CreatureProperties, creatureId);
      console.log('Rebuilt nested sets');
    }
  } catch (e) {
    console.warn('Could not auto-rebuild nested sets:', e.message);
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n========================================');
  console.log('Sample Character Created: Jadamantha Holland');
  console.log('========================================');
  console.log(`Creature ID: ${creatureId}`);
  console.log(`Owner: ${ownerId}`);
  console.log(`Game System: expanse`);
  console.log('');
  console.log('Expected computed values (verify in UI after compute):');
  console.log('  Toughness: 11 (10 + CON 1)');
  console.log('  Defense:   11 (10 + DEX 1)');
  console.log('  Speed:     13 (10 + DEX 1 + PER 2)');
  console.log('  Fortune:   13 (10 + Level 1 × 2 + CON 1)');
  console.log('');
  console.log('View in UI at: http://localhost:3000/character/' + creatureId);

  return creatureId;
})();
