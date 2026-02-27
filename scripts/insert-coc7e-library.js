/**
 * CoC 7e Investigator Base Library - Meteor Shell Insertion Script
 *
 * This script creates a Call of Cthulhu 7th Edition "Investigator Base" library
 * in DiceCloud using the existing Library system — no code changes required.
 *
 * Usage:
 *   cd app
 *   meteor shell
 *   > .load ../scripts/insert-coc7e-library.js
 *
 * Or via eval from the Meteor shell:
 *   meteor shell --eval "$(cat ../scripts/insert-coc7e-library.js)"
 *
 * Prerequisites:
 *   - Meteor app must be running (meteor run --settings exampleMeteorSettings.json)
 *   - An admin/owner user must exist. Set OWNER_ID below or it defaults to the
 *     first user in the database.
 *
 * What this creates:
 *   1. A Library document: "CoC 7e - Investigator Base"
 *   2. A root library node (propertySlot) that fills the "Ruleset" base slot
 *   3. 8 Core Characteristics (STR, CON, SIZ, DEX, APP, INT, POW, EDU) as 'stat' attributes
 *   4. 5 Derived Stats (HP, MP, SAN, Luck, Movement Rate)
 *   5. 2 Edge-case stats (Damage Bonus, Build) using nested ternary formulas
 *   6. 8 Representative skills with base percentages
 *   7. A sample "Stealth Check" action with 1d100 roll
 *   8. A stretch-goal Sanity mechanic: Cthulhu Mythos skill + Sanity Roll action
 */

// ============================================================================
// Configuration
// ============================================================================

// Set this to a real user ID, or leave null to use the first user found.
const OWNER_ID = null;

// ============================================================================
// Imports (available in Meteor shell context)
// ============================================================================

const { Meteor } = require('meteor/meteor');
const { Random } = require('meteor/random');

// Access collections directly
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

(function insertCoC7eLibrary() {
  const ownerId = getOwnerId();

  // --------------------------------------------------------------------------
  // 1. Create the Library document
  // --------------------------------------------------------------------------
  const libraryId = id();

  Libraries.insert({
    _id: libraryId,
    name: 'CoC 7e - Investigator Base',
    description: 'Call of Cthulhu 7th Edition base investigator ruleset. ' +
      'Provides core characteristics (STR, CON, SIZ, DEX, APP, INT, POW, EDU), ' +
      'derived stats (HP, MP, SAN, Luck, Damage Bonus, Build, MOV), ' +
      'representative skills, and a sample Sanity mechanic. ' +
      'This is a vibe-hack test library to probe DiceCloud\'s multi-system limits.',
    owner: ownerId,
    readers: [],
    writers: [],
    public: true,
    readersCanCopy: true,
  });

  console.log(`Created library: ${libraryId} — "CoC 7e - Investigator Base"`);

  const libraryRef = { id: libraryId, collection: 'libraries' };

  // --------------------------------------------------------------------------
  // Helper: insert a library node
  // --------------------------------------------------------------------------
  // We track a counter for left/right nested set values. We'll rebuild after.
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
  // 2. Root Node: Ruleset slot filler
  // --------------------------------------------------------------------------
  const rootNodeId = makeNode({
    type: 'folder',
    name: 'CoC 7e Investigator Ruleset',
    fillSlots: true,
    libraryTags: ['base'],
    // Root-level nodes have no parentId (they are direct children of the library)
    // parentId is intentionally omitted
  });

  // --------------------------------------------------------------------------
  // 3. Core Characteristics (Phase 2)
  //    Using attributeType: 'stat' to avoid the D&D (score-10)/2 modifier formula
  // --------------------------------------------------------------------------
  const characteristics = [
    { variableName: 'str', name: 'STR', description: 'Strength — physical power' },
    { variableName: 'con', name: 'CON', description: 'Constitution — health and hardiness' },
    { variableName: 'siz', name: 'SIZ', description: 'Size — physical mass' },
    { variableName: 'dex', name: 'DEX', description: 'Dexterity — agility and speed' },
    { variableName: 'app', name: 'APP', description: 'Appearance — charm and physical attractiveness' },
    // NOTE: 'int' is a potentially problematic variable name (reserved word in some contexts)
    // but DiceCloud's parser should handle it as a variable reference
    { variableName: 'intl', name: 'INT', description: 'Intelligence — reasoning and education capacity. Variable is "intl" to avoid conflict with potential reserved words.' },
    { variableName: 'pow', name: 'POW', description: 'Power — willpower, mental strength, psychic ability' },
    { variableName: 'edu', name: 'EDU', description: 'Education — book learning and formal knowledge' },
  ];

  const charIds = {};
  for (const char of characteristics) {
    charIds[char.variableName] = makeNode({
      type: 'attribute',
      name: char.name,
      variableName: char.variableName,
      attributeType: 'stat',
      baseValue: { calculation: '50' },
      decimal: false,
      description: { text: char.description },
      parentId: rootNodeId,
    });
  }

  console.log(`Created ${characteristics.length} core characteristics`);

  // --------------------------------------------------------------------------
  // 4. Derived Stats (Phase 3)
  // --------------------------------------------------------------------------

  // Hit Points: floor((CON + SIZ) / 10)
  makeNode({
    type: 'attribute',
    name: 'HP',
    variableName: 'hitPoints',
    attributeType: 'healthBar',
    baseValue: { calculation: 'floor((con + siz) / 10)' },
    decimal: false,
    description: { text: 'Hit Points = floor((CON + SIZ) / 10). When HP reaches 0, the investigator is dying.' },
    parentId: rootNodeId,
  });

  // Magic Points: floor(POW / 5)
  makeNode({
    type: 'attribute',
    name: 'MP',
    variableName: 'magicPoints',
    attributeType: 'resource',
    baseValue: { calculation: 'floor(pow / 5)' },
    decimal: false,
    description: { text: 'Magic Points = floor(POW / 5). Used to cast spells and power magical abilities.' },
    parentId: rootNodeId,
  });

  // Sanity: starts at POW value, max is 99 - Cthulhu Mythos
  // Using healthBar so damage can be tracked
  makeNode({
    type: 'attribute',
    name: 'SAN',
    variableName: 'sanity',
    attributeType: 'healthBar',
    baseValue: { calculation: 'pow' },
    decimal: false,
    description: { text: 'Sanity = POW (starting value). Maximum Sanity = 99 - Cthulhu Mythos skill. When SAN reaches 0, the investigator goes permanently insane.' },
    parentId: rootNodeId,
  });

  // Luck: rolled at creation (3d6×5), stored as a value the player edits
  makeNode({
    type: 'attribute',
    name: 'Luck',
    variableName: 'luck',
    attributeType: 'resource',
    baseValue: { calculation: '50' },
    decimal: false,
    description: { text: 'Luck = 3d6×5 (rolled at character creation). Spend Luck points to boost skill rolls. Luck does not regenerate.' },
    parentId: rootNodeId,
  });

  // Movement Rate: based on STR/DEX vs SIZ comparison
  // Simplified: if both STR and DEX >= SIZ then 8, if either >= SIZ then 7, else 6
  // (Age modifiers not included in this test)
  makeNode({
    type: 'attribute',
    name: 'MOV',
    variableName: 'movementRate',
    attributeType: 'stat',
    baseValue: {
      calculation: '(str >= siz && dex >= siz) ? 8 : (str >= siz || dex >= siz) ? 7 : 6',
    },
    decimal: false,
    description: { text: 'Movement Rate. If both STR and DEX >= SIZ: 8. If either >= SIZ: 7. Otherwise: 6. (Age modifiers not included.)' },
    parentId: rootNodeId,
  });

  console.log('Created 5 derived stats (HP, MP, SAN, Luck, MOV)');

  // --------------------------------------------------------------------------
  // 5. Damage Bonus & Build (Phase 4 — edge case tests)
  // --------------------------------------------------------------------------

  // Damage Bonus: lookup table based on STR + SIZ
  // 2–64: -2, 65–84: -1, 85–124: 0, 125–164: +1d4, 165–204: +2d6
  //
  // CRITICAL TEST: Can the parser handle dice notation inside ternary?
  // First try: flat numeric approximation for the attribute value
  // The actual dice (1d4, 1d6, 2d6) should be in a roll action, not in the stat.
  //
  // For the stored stat, we encode the "tier" as a number:
  //   -2, -1, 0, 1, 2, 4 (tiers)
  // The action that rolls damage bonus will use a separate ternary with dice.
  makeNode({
    type: 'attribute',
    name: 'Damage Bonus (Flat)',
    variableName: 'damageBonusFlat',
    attributeType: 'stat',
    baseValue: {
      calculation: '(str + siz) <= 64 ? -2 : (str + siz) <= 84 ? -1 : (str + siz) <= 124 ? 0 : (str + siz) <= 164 ? 2 : 4',
    },
    decimal: false,
    description: { text: 'Damage Bonus flat approximation (STR+SIZ table). -2/-1/0/+2/+4 tiers. For actual dice rolls, use the Damage Bonus Roll action.' },
    parentId: rootNodeId,
  });

  // Build: same table as DB but different values
  makeNode({
    type: 'attribute',
    name: 'Build',
    variableName: 'build',
    attributeType: 'stat',
    baseValue: {
      calculation: '(str + siz) <= 64 ? -2 : (str + siz) <= 84 ? -1 : (str + siz) <= 124 ? 0 : (str + siz) <= 164 ? 1 : 2',
    },
    decimal: false,
    description: { text: 'Build rating derived from STR+SIZ. Range: -2 to +2.' },
    parentId: rootNodeId,
  });

  // Damage Bonus Roll Action — uses dice notation in ternary
  // THIS IS THE REAL EDGE CASE TEST
  const dbRollActionId = makeNode({
    type: 'action',
    name: 'Damage Bonus Roll',
    actionType: 'free',
    summary: { text: 'Roll your damage bonus dice based on STR+SIZ' },
    description: { text: 'Rolls the appropriate damage bonus dice. STR+SIZ 2-64: -2 flat, 65-84: -1 flat, 85-124: +1d4, 125-164: +1d6, 165-204: +2d6.' },
    parentId: rootNodeId,
  });

  // Roll child of the damage bonus action — ternary with dice
  makeNode({
    type: 'roll',
    name: 'Damage Bonus',
    variableName: 'damageBonusRoll',
    roll: {
      calculation: '(str + siz) <= 64 ? -2 : (str + siz) <= 84 ? -1 : (str + siz) <= 124 ? 1d4 : (str + siz) <= 164 ? 1d6 : 2d6',
    },
    parentId: dbRollActionId,
  });

  console.log('Created Damage Bonus + Build (with dice-in-ternary edge case test)');

  // --------------------------------------------------------------------------
  // 6. Skills (Phase 5)
  //    Using skillType: 'skill', ability: '' (no linked ability), proficiency: 0
  // --------------------------------------------------------------------------
  const skills = [
    { variableName: 'stealth', name: 'Stealth', base: '20' },
    { variableName: 'spotHidden', name: 'Spot Hidden', base: '25' },
    { variableName: 'listen', name: 'Listen', base: '20' },
    { variableName: 'dodge', name: 'Dodge', base: 'floor(dex / 2)' },
    { variableName: 'fighting', name: 'Fighting (Brawl)', base: '25' },
    { variableName: 'firearms', name: 'Firearms (Handgun)', base: '20' },
    { variableName: 'libraryUse', name: 'Library Use', base: '20' },
    { variableName: 'psychology', name: 'Psychology', base: '10' },
  ];

  const skillIds = {};
  for (const skill of skills) {
    skillIds[skill.variableName] = makeNode({
      type: 'skill',
      name: skill.name,
      variableName: skill.variableName,
      skillType: 'skill',
      ability: '',          // No linked ability — CoC skills stand alone
      baseProficiency: 0,   // No proficiency bonus concept
      baseValue: { calculation: skill.base },
      parentId: rootNodeId,
    });
  }

  console.log(`Created ${skills.length} representative skills`);

  // --------------------------------------------------------------------------
  // 7. Sample Action: Stealth Check (Phase 5 — roll test)
  // --------------------------------------------------------------------------
  const stealthCheckId = makeNode({
    type: 'action',
    name: 'Stealth Check',
    actionType: 'action',
    summary: { text: 'Roll d100 vs Stealth' },
    description: { text: 'Roll 1d100. Compare to Stealth skill.\n• Regular success: roll ≤ Stealth\n• Hard success: roll ≤ half Stealth\n• Extreme success: roll ≤ one-fifth Stealth\n\nNote: success/failure must be compared manually.' },
    parentId: skillIds['stealth'],
  });

  makeNode({
    type: 'roll',
    name: 'Stealth Roll',
    variableName: 'stealthRoll',
    roll: { calculation: '1d100' },
    parentId: stealthCheckId,
  });

  console.log('Created Stealth Check action with 1d100 roll');

  // --------------------------------------------------------------------------
  // 8. Generic Skill Check Action (reusable pattern)
  // --------------------------------------------------------------------------
  const genericCheckId = makeNode({
    type: 'action',
    name: 'Quick d100 Roll',
    actionType: 'free',
    summary: { text: 'Roll a d100 for any skill check' },
    description: { text: 'Rolls 1d100. Compare result manually to the relevant skill percentage.' },
    parentId: rootNodeId,
  });

  makeNode({
    type: 'roll',
    name: 'd100 Roll',
    variableName: 'quickD100',
    roll: { calculation: '1d100' },
    parentId: genericCheckId,
  });

  // --------------------------------------------------------------------------
  // 9. Stretch Goal: Sanity Mechanic
  // --------------------------------------------------------------------------

  // Cthulhu Mythos skill — affects max sanity
  const cthulhuMythosId = makeNode({
    type: 'skill',
    name: 'Cthulhu Mythos',
    variableName: 'cthulhuMythos',
    skillType: 'skill',
    ability: '',
    baseProficiency: 0,
    baseValue: { calculation: '0' },
    description: { text: 'Knowledge of the Cthulhu Mythos. Each point reduces maximum Sanity by 1 (max SAN = 99 - Cthulhu Mythos). This skill cannot be learned normally — only through encounters with the Mythos.' },
    parentId: rootNodeId,
  });

  // Effect: reduce sanity max by Cthulhu Mythos value
  // This targets the 'sanity' attribute with a 'max' operation
  makeNode({
    type: 'effect',
    name: 'Mythos Sanity Cap',
    operation: 'max',
    amount: { calculation: '99 - cthulhuMythos' },
    stats: ['sanity'],
    description: { text: 'Maximum Sanity = 99 - Cthulhu Mythos skill value.' },
    parentId: cthulhuMythosId,
  });

  // Sanity Roll Action with branching
  const sanityRollActionId = makeNode({
    type: 'action',
    name: 'Sanity Roll',
    actionType: 'action',
    summary: { text: 'Roll 1d100 vs SAN' },
    description: { text: 'Make a Sanity roll. Roll 1d100:\n• If roll ≤ current SAN: Success (lose minimum sanity, typically 0 or 1)\n• If roll > current SAN: Failure (lose maximum sanity, typically 1d6 or more)\n\nThe loss amounts depend on the encounter — adjust the result manually.' },
    parentId: rootNodeId,
  });

  // Roll the d100
  makeNode({
    type: 'roll',
    name: 'Sanity Roll',
    variableName: 'sanityRoll',
    roll: { calculation: '1d100' },
    parentId: sanityRollActionId,
  });

  // Branch: check success/failure
  // Using branchType: 'if' with condition comparing roll to sanity value
  const sanityBranchId = makeNode({
    type: 'branch',
    name: 'Sanity Check Result',
    branchType: 'if',
    // sanityRoll is the roll result, sanity.value is the current sanity
    condition: { calculation: 'sanityRoll <= sanity' },
    text: 'Sanity roll succeeded',
    parentId: sanityRollActionId,
  });

  // On success: lose 0 sanity (the minimum — keeper may override)
  makeNode({
    type: 'note',
    name: 'Success — Minimal Sanity Loss',
    description: { text: 'The sanity roll succeeded. Lose the minimum amount of sanity for this encounter (often 0 or 1). Apply sanity loss manually via the SAN health bar.' },
    parentId: sanityBranchId,
  });

  // The else branch (failure) is implicit — when condition is false, children don't fire
  // We add a separate note at the action level for the failure case
  makeNode({
    type: 'note',
    name: 'If Failed — Major Sanity Loss',
    description: { text: 'If the sanity roll failed (roll > current SAN), lose the maximum amount of sanity for this encounter (often 1d6 or more). Apply sanity loss manually via the SAN health bar.\n\nIf 5+ SAN lost at once, the investigator goes temporarily insane.' },
    parentId: sanityRollActionId,
  });

  console.log('Created Sanity mechanic (Cthulhu Mythos skill + Sanity Roll action with branch)');

  // --------------------------------------------------------------------------
  // 10. Creature Settings Hints (as a note)
  // --------------------------------------------------------------------------
  makeNode({
    type: 'note',
    name: 'CoC 7e Setup Notes',
    description: { text: 'After applying this ruleset to a character, configure these settings:\n\n' +
      '• Hide Spells Tab: YES (CoC has no spell slots system)\n' +
      '• Hide Rest Buttons: YES (CoC has no short/long rest system)\n' +
      '• Show Tree Tab: Recommended for debugging\n\n' +
      'To set characteristic values: edit each stat (STR, CON, etc.) and change the base value.\n\n' +
      'Known limitations of this library:\n' +
      '• Skill rolls don\'t auto-resolve success/failure — compare d100 result manually\n' +
      '• Damage Bonus is split: flat value attribute + dice roll action\n' +
      '• Sanity loss must be applied manually to the SAN health bar\n' +
      '• No occupation/backstory system (use Features tab for narrative)\n' +
      '• No Luck spending mechanic (track Luck as a resource manually)\n' +
      '• The Stats tab will show some empty D&D sections (Hit Dice, Spell Slots)',
    },
    parentId: rootNodeId,
  });

  // --------------------------------------------------------------------------
  // Batch insert all nodes
  // --------------------------------------------------------------------------
  console.log(`\nInserting ${allNodes.length} library nodes...`);

  // We need to rebuild nested sets properly. For now, insert with placeholder
  // left/right values and then trigger a rebuild.
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
    console.log('Nested sets may need manual rebuild. The library should still work.');
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n========================================');
  console.log('CoC 7e Library Insertion Complete!');
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
  console.log('1. Create a new character in the DiceCloud UI');
  console.log('2. Fill the "Ruleset" slot with "CoC 7e Investigator Ruleset"');
  console.log('3. Go to character settings and hide Spells tab + Rest buttons');
  console.log('4. Edit characteristic base values to match your investigator');
  console.log('5. Test formulas: change CON/SIZ and verify HP updates');
  console.log('6. Test actions: run Stealth Check, Sanity Roll, Damage Bonus Roll');
  console.log('');
  console.log('See docs/vibe-hack-coc-results.md for detailed test analysis.');

  return libraryId;
})();
