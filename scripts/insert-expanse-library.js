/**
 * The Expanse RPG — AGE System — Investigator Base Library
 *
 * VH-003: Third vibe-hack — The Expanse RPG using the Adventure Game Engine.
 * Tests the multi-system viability of DiceCloud for a non-D&D, non-percentile system.
 *
 * Key design choices:
 * - attributeType: 'stat' for all 9 abilities (score IS the modifier, range -2 to 4)
 * - No proficiency bonus — focuses simply add +2 to the roll
 * - Fortune replaces HP as the primary health/resource bar (dual-purpose: absorbs damage AND spendable)
 * - All rolls are 3d6 + ability vs TN (typically 11 for standard tasks)
 *
 * Usage:
 *   cd app
 *   meteor shell
 *   > .load ../scripts/insert-expanse-library.js
 *
 * Prerequisites:
 *   - Meteor app must be running (meteor run --settings exampleMeteorSettings.json)
 *   - An admin/owner user must exist.
 */

// ============================================================================
// Configuration
// ============================================================================

const OWNER_ID = null; // null = use first user found

// ============================================================================
// Imports (available in Meteor shell context)
// ============================================================================

const { Meteor } = require('meteor/meteor');
const { Random } = require('meteor/random');

const Libraries = require('/imports/api/library/Libraries').default
  || require('/imports/api/library/Libraries').Libraries;
const LibraryNodes = require('/imports/api/library/LibraryNodes').default
  || require('/imports/api/library/LibraryNodes').LibraryNodes;

// ============================================================================
// Helpers
// ============================================================================

function getOwnerId() {
  if (OWNER_ID) return OWNER_ID;
  const user = Meteor.users.findOne({}, { fields: { _id: 1 } });
  if (!user) throw new Error('No users found. Create an account first.');
  console.log(`Using owner: ${user._id}`);
  return user._id;
}

function id() {
  return Random.id();
}

// ============================================================================
// Main insertion logic
// ============================================================================

(function insertExpanseLibrary() {
  const ownerId = getOwnerId();

  // --------------------------------------------------------------------------
  // 1. Create the Library document
  // --------------------------------------------------------------------------
  const libraryId = id();

  Libraries.insert({
    _id: libraryId,
    name: 'The Expanse RPG — AGE System',
    description: 'Core ruleset for The Expanse RPG using the Adventure Game Engine. ' +
      'Includes 9 Abilities (Accuracy through Willpower), 3 derived stats (Toughness, Defense, Speed), ' +
      'Fortune (dual-purpose health bar and resource pool), 6 sample Focuses, ' +
      '9 ability roll actions, and 5 condition toggles.',
    gameSystem: 'expanse',
    owner: ownerId,
    readers: [],
    writers: [],
    public: true,
    readersCanCopy: true,
  });

  console.log(`Created library: ${libraryId} — "The Expanse RPG — AGE System"`);

  const libraryRef = { id: libraryId, collection: 'libraries' };

  // --------------------------------------------------------------------------
  // Node tracking
  // --------------------------------------------------------------------------
  let nodeCounter = 0;
  const allNodes = [];

  function makeNode(overrides) {
    const nodeId = overrides._id || id();
    nodeCounter++;
    const left = nodeCounter * 2 - 1;
    const right = nodeCounter * 2;
    const node = {
      _id: nodeId,
      root: libraryRef,
      tags: [],
      left,
      right,
      ...overrides,
    };
    allNodes.push(node);
    return nodeId;
  }

  // --------------------------------------------------------------------------
  // 2. Root node — Ruleset slot filler
  // --------------------------------------------------------------------------
  const rootNodeId = makeNode({
    type: 'folder',
    name: 'The Expanse Ruleset',
    fillSlots: true,
    libraryTags: ['base'],
  });

  // --------------------------------------------------------------------------
  // 3. Level
  // --------------------------------------------------------------------------
  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'level',
    name: 'Level',
    baseValue: { calculation: '1' },
    decimal: false,
    description: { text: 'Character level. Affects Fortune pool size (Fortune = 10 + level × 2 + Constitution).' },
    parentId: rootNodeId,
  });

  console.log('Created Level');

  // --------------------------------------------------------------------------
  // 4. 9 Abilities (AGE System — score IS the modifier, range typically -2 to 4)
  //    attributeType: 'stat' bypasses D&D modifier formula
  // --------------------------------------------------------------------------
  const abilities = [
    { variableName: 'accuracy',      name: 'Accuracy',      description: 'Ranged attacks, precise shots.' },
    { variableName: 'communication', name: 'Communication', description: 'Persuasion, leadership, performance.' },
    { variableName: 'constitution',  name: 'Constitution',  description: 'Health, endurance, resistance.' },
    { variableName: 'dexterity',     name: 'Dexterity',     description: 'Speed, stealth, acrobatics.' },
    { variableName: 'fighting',      name: 'Fighting',      description: 'Melee attacks and brawling.' },
    { variableName: 'intelligence',  name: 'Intelligence',  description: 'Knowledge, tech, problem-solving.' },
    { variableName: 'perception',    name: 'Perception',    description: 'Awareness, detecting threats.' },
    { variableName: 'strength',      name: 'Strength',      description: 'Physical power, lifting, climbing.' },
    { variableName: 'willpower',     name: 'Willpower',     description: 'Mental fortitude, courage, discipline.' },
  ];

  for (const ability of abilities) {
    makeNode({
      type: 'attribute',
      attributeType: 'stat',
      variableName: ability.variableName,
      name: ability.name,
      baseValue: { calculation: '1' },
      decimal: false,
      description: { text: ability.description + ' Range: -2 to 4 (starting). Roll: 3d6 + ' + ability.name + ' vs TN.' },
      parentId: rootNodeId,
    });
  }

  console.log(`Created ${abilities.length} abilities`);

  // --------------------------------------------------------------------------
  // 5. Derived stats
  // --------------------------------------------------------------------------

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'toughness',
    name: 'Toughness',
    baseValue: { calculation: '10 + constitution' },
    decimal: false,
    description: { text: 'Toughness = 10 + Constitution. Represents physical resilience — not a hit point pool.' },
    parentId: rootNodeId,
  });

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'defense',
    name: 'Defense',
    baseValue: { calculation: '10 + dexterity' },
    decimal: false,
    description: { text: 'Defense = 10 + Dexterity. Attackers must beat this TN to hit.' },
    parentId: rootNodeId,
  });

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'speed',
    name: 'Speed',
    baseValue: { calculation: '10 + dexterity + perception' },
    decimal: false,
    description: { text: 'Speed = 10 + Dexterity + Perception. Yards moved per round.' },
    parentId: rootNodeId,
  });

  console.log('Created 3 derived stats (Toughness, Defense, Speed)');

  // --------------------------------------------------------------------------
  // 6. Fortune (dual-purpose: absorbs damage AND spendable resource)
  // --------------------------------------------------------------------------

  makeNode({
    type: 'attribute',
    attributeType: 'healthBar',
    variableName: 'fortune',
    name: 'Fortune',
    baseValue: { calculation: '10 + level * 2 + constitution' },
    decimal: false,
    description: { text: 'Fortune = 10 + Level × 2 + Constitution. Absorbs all damage 1-for-1 AND can be spent (up to 6) to modify one die after rolling. At 0: character is Taken Out.' },
    parentId: rootNodeId,
  });

  console.log('Created Fortune (health bar + resource pool)');

  // --------------------------------------------------------------------------
  // 7. Income
  // --------------------------------------------------------------------------

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'income',
    name: 'Income',
    baseValue: { calculation: '0' },
    decimal: false,
    description: { text: 'Income score (0–5). Used in social/economic tests instead of tracking currency. Set manually based on character wealth level.' },
    parentId: rootNodeId,
  });

  // --------------------------------------------------------------------------
  // 8. 6 Sample Focuses (skillType: 'skill', proficiency 1 = +2 on rolls)
  //    In AGE: a Focus adds +2 to rolls with its linked ability.
  //    Modeled as skills with baseValue 2 and the linked ability as 'ability'.
  // --------------------------------------------------------------------------
  const focuses = [
    { variableName: 'focusStealth',      name: 'Stealth',     ability: 'dexterity',     description: 'Moving quietly and avoiding detection.' },
    { variableName: 'focusTechnology',   name: 'Technology',  ability: 'intelligence',  description: 'Operating, repairing, and hacking electronic systems.' },
    { variableName: 'focusBargaining',   name: 'Bargaining',  ability: 'communication', description: 'Negotiating deals and trade.' },
    { variableName: 'focusPiloting',     name: 'Piloting',    ability: 'dexterity',     description: 'Flying spacecraft and vehicles.' },
    { variableName: 'focusFreeFall',     name: 'Free-fall',   ability: 'dexterity',     description: 'Moving and fighting in zero-g environments.' },
    { variableName: 'focusGambling',     name: 'Gambling',    ability: 'communication', description: 'Games of chance and reading opponents.' },
  ];

  for (const focus of focuses) {
    makeNode({
      type: 'skill',
      skillType: 'skill',
      variableName: focus.variableName,
      name: focus.name,
      ability: focus.ability,
      baseProficiency: 1,
      baseValue: { calculation: '2' },
      description: { text: focus.description + ' Add +2 to ' + focus.ability.charAt(0).toUpperCase() + focus.ability.slice(1) + ' rolls when this Focus applies.' },
      parentId: rootNodeId,
    });
  }

  console.log(`Created ${focuses.length} sample Focuses`);

  // --------------------------------------------------------------------------
  // 9. 9 Ability Roll actions (one per ability)
  // --------------------------------------------------------------------------

  for (const ability of abilities) {
    const abilityName = ability.name;
    const abilityVar = ability.variableName;
    const actionId = makeNode({
      type: 'action',
      name: `${abilityName} Roll`,
      actionType: 'free',
      summary: { text: `3d6 + ${abilityName} vs TN (typically 11)` },
      description: { text: `Roll 3d6 + ${abilityName}. Add +2 if you have a relevant Focus. The Drama Die (one specific d6) generates Stunt Points on doubles.` },
      parentId: rootNodeId,
    });
    makeNode({
      type: 'roll',
      name: 'Roll',
      variableName: `roll${abilityName.replace(/\s+/g, '')}`,
      roll: { calculation: `3d6 + ${abilityVar}` },
      parentId: actionId,
    });
  }

  console.log(`Created ${abilities.length} ability roll actions`);

  // --------------------------------------------------------------------------
  // 10. Fortune Spend action
  // --------------------------------------------------------------------------
  makeNode({
    type: 'action',
    name: 'Spend Fortune',
    actionType: 'free',
    description: { text: 'After rolling, spend up to 6 Fortune Points to add that many to one die result. Reduce Fortune current value by the amount spent. Cannot be used after the roll is resolved.' },
    parentId: rootNodeId,
  });

  // --------------------------------------------------------------------------
  // 11. Conditions as toggles with child effects
  // --------------------------------------------------------------------------

  // Hindered: speed × 0.5
  const hinderedId = makeNode({
    type: 'toggle',
    name: 'Hindered',
    description: { text: 'Movement is impeded (rough terrain, restrained, etc.). Speed is halved.' },
    showUI: true,
    parentId: rootNodeId,
  });
  makeNode({
    type: 'effect',
    operation: 'mul',
    amount: { calculation: '0.5' },
    stats: ['speed'],
    name: 'Hindered: Speed × 0.5',
    parentId: hinderedId,
  });

  // Restrained: speed × 0.5 (different flavor — grabbed, pinned)
  const restrainedId = makeNode({
    type: 'toggle',
    name: 'Restrained',
    description: { text: 'Character is grabbed or pinned. Speed is halved. Different from Hindered — source is physical restraint.' },
    showUI: true,
    parentId: rootNodeId,
  });
  makeNode({
    type: 'effect',
    operation: 'mul',
    amount: { calculation: '0.5' },
    stats: ['speed'],
    name: 'Restrained: Speed × 0.5',
    parentId: restrainedId,
  });

  // Injured: -1 to all 9 abilities
  const injuredId = makeNode({
    type: 'toggle',
    name: 'Injured',
    description: { text: '-1 penalty to all 9 Ability scores. Typically from taking a hit that exceeds Toughness by 1–3.' },
    showUI: true,
    parentId: rootNodeId,
  });
  makeNode({
    type: 'effect',
    operation: 'add',
    amount: { calculation: '-1' },
    stats: abilities.map(a => a.variableName),
    name: 'Injured: -1 to all abilities',
    parentId: injuredId,
  });

  // Wounded: -2 to all 9 abilities + speed halved
  const woundedId = makeNode({
    type: 'toggle',
    name: 'Wounded',
    description: { text: '-2 penalty to all 9 Ability scores, and Speed is halved. Typically from taking a hit that exceeds Toughness by 4+.' },
    showUI: true,
    parentId: rootNodeId,
  });
  makeNode({
    type: 'effect',
    operation: 'add',
    amount: { calculation: '-2' },
    stats: abilities.map(a => a.variableName),
    name: 'Wounded: -2 to all abilities',
    parentId: woundedId,
  });
  makeNode({
    type: 'effect',
    operation: 'mul',
    amount: { calculation: '0.5' },
    stats: ['speed'],
    name: 'Wounded: Speed × 0.5',
    parentId: woundedId,
  });

  // Dying: descriptive only — manual tracking
  makeNode({
    type: 'toggle',
    name: 'Dying',
    description: { text: 'Character is dying. Lose 1 Constitution per round until stabilized (TN 13 Constitution test, can be assisted) or dead. Mark manually.' },
    showUI: true,
    parentId: rootNodeId,
  });

  console.log('Created 5 condition toggles (Hindered, Restrained, Injured, Wounded, Dying)');

  // --------------------------------------------------------------------------
  // 12. Setup Note
  // --------------------------------------------------------------------------
  makeNode({
    type: 'note',
    name: 'The Expanse RPG Setup Notes',
    description: { text: 'After applying this ruleset:\n\n' +
      '• Hide Rest Buttons: YES (The Expanse has no short/long rest system)\n' +
      '• Hide Spells Tab: YES (no spell slots)\n' +
      '• Set Ability scores manually (typical starting range: -2 to 4)\n\n' +
      'Core roll mechanic: 3d6 + Ability vs TN (usually 11 for average tasks).\n' +
      'One of the three d6 is the Drama Die — if two dice show the same value, you get Stunt Points equal to the Drama Die.\n\n' +
      'Focuses add +2 to rolls when applicable. No separate proficiency bonus.\n\n' +
      'Fortune: tracks current HP (reduce when taking hits). Also spendable resource (up to 6/roll).\n\n' +
      'See docs/expanse-playtest-guide.md for full rules reference.',
    },
    parentId: rootNodeId,
  });

  // --------------------------------------------------------------------------
  // Batch insert all nodes
  // --------------------------------------------------------------------------
  console.log(`\nInserting ${allNodes.length} library nodes...`);

  for (const node of allNodes) {
    try {
      LibraryNodes.insert(node);
    } catch (e) {
      console.error(`Failed to insert node "${node.name}" (${node.type}):`, e.message);
    }
  }

  // Rebuild nested sets
  try {
    const { rebuildNestedSets } = require('/imports/api/parenting/parentingFunctions');
    if (rebuildNestedSets) {
      rebuildNestedSets(LibraryNodes, libraryId);
      console.log('Rebuilt nested sets');
    }
  } catch (e) {
    console.warn('Could not auto-rebuild nested sets:', e.message);
    console.log('Library should still work without nested set rebuild.');
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n========================================');
  console.log('The Expanse RPG Library Insertion Complete!');
  console.log('========================================');
  console.log(`Library ID: ${libraryId}`);
  console.log(`Total nodes: ${allNodes.length}`);
  console.log('');
  console.log('Node breakdown:');
  const typeCounts = {};
  for (const n of allNodes) {
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(typeCounts).sort()) {
    console.log(`  ${type}: ${count}`);
  }
  console.log('');
  console.log('Next steps:');
  console.log('1. Create a new character with gameSystem: "expanse"');
  console.log('2. Fill the "Ruleset" slot with "The Expanse Ruleset"');
  console.log('3. Set character settings: hide Spells tab, hide Rest buttons');
  console.log('4. Edit Ability scores to match your character');
  console.log('5. Verify derived stats: Toughness, Defense, Speed, Fortune');
  console.log('6. See scripts/create-expanse-sample-character.js for a pre-built example');

  return libraryId;
})();
