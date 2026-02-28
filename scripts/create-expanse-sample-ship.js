/**
 * The Expanse RPG — Sample Ship: The Rocinante
 *
 * Converted MCRN Corvette-class light frigate — The Rocinante
 * Crew: Holden (Commander), Naomi (Engineer/EW), Alex (Pilot), Amos (Gunner)
 *
 * Usage:
 *   cd app
 *   meteor shell
 *   > .load ../scripts/create-expanse-sample-ship.js
 *
 * IMPORTANT: Run insert-expanse-ship-library.js first to create the ship library.
 * This script creates the ship creature with all stats pre-set.
 * In a real game, you would fill the slot from the library; this script
 * hard-codes stats for testing.
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
  return user._id;
}

function id() {
  return Random.id();
}

// ============================================================================
// Main
// ============================================================================

(function createRocinante() {
  const ownerId = getOwnerId();
  const creatureId = id();

  // --------------------------------------------------------------------------
  // 1. Create the Creature document
  //    Ships use type: 'npc' — they are creatures but not player characters
  // --------------------------------------------------------------------------
  Creatures.insert({
    _id: creatureId,
    name: 'Rocinante',
    owner: ownerId,
    readers: [],
    writers: [],
    public: false,
    type: 'npc',
    gameSystem: 'expanse-ship',
    settings: {
      hideRestButtons: true,
      hideSpellsTab: true,
      showTreeTab: false,
      hideUnusedStats: false,
    },
    dirty: true,
  });

  console.log(`Created creature: ${creatureId} — "Rocinante"`);

  const creatureRef = { id: creatureId, collection: 'creatures' };
  let nodeCounter = 100;
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
  // 2. Root folder
  // --------------------------------------------------------------------------
  const rootFolderId = makeProp({
    type: 'folder',
    name: 'Rocinante',
    parentId: undefined,
  });

  // --------------------------------------------------------------------------
  // 3. Core ship stats
  //    Rocinante: corvette-class, well-armored for its size, excellent sensors
  //    No torpedoes (lightly armed — uses rail guns and PDCs)
  // --------------------------------------------------------------------------

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'hull',
    name: 'Hull Rating',
    baseValue: { calculation: '15' },
    decimal: false,
    description: { text: 'Hull 15 — MCRN corvette armor. Subtracts from incoming weapon damage.' },
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'sensors',
    name: 'Sensors',
    baseValue: { calculation: '3' },
    decimal: false,
    description: { text: 'Sensors 3 — Military-grade targeting and detection array. Attack TN vs Roci = 11 + 3 = 14.' },
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'maneuverability',
    name: 'Maneuverability',
    baseValue: { calculation: '1' },
    decimal: false,
    description: { text: 'Maneuverability +1 — Corvette-class agility. Add to Piloting range-shift tests.' },
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'rangeBand',
    name: 'Range Band',
    baseValue: { calculation: '1' },
    decimal: false,
    description: { text: 'Current range to target. 0=Long, 1=Medium, 2=Close. Start at 1 (Medium) for most engagements. Update as combat progresses.' },
    parentId: rootFolderId,
  });

  // --------------------------------------------------------------------------
  // 4. Derived TNs (auto-computed from sensors)
  // --------------------------------------------------------------------------

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'attackTN',
    name: 'Attack TN (vs Roci)',
    baseValue: { calculation: '11 + sensors' },
    decimal: false,
    description: { text: 'TN enemies must beat to hit the Rocinante. = 11 + Sensors (14 base).' },
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'evasionTN',
    name: 'Evasion TN',
    baseValue: { calculation: '10 + sensors' },
    decimal: false,
    description: { text: 'BEFORE evasion: override this to 10 + ATTACKING ship\'s Sensors. Base: 10 + Roci Sensors (13).' },
    parentId: rootFolderId,
  });

  // --------------------------------------------------------------------------
  // 5. Ship HP
  // --------------------------------------------------------------------------

  makeProp({
    type: 'attribute',
    attributeType: 'healthBar',
    variableName: 'shipHP',
    name: 'Ship Hull Points',
    baseValue: { calculation: 'hull' },
    decimal: false,
    description: { text: 'Rocinante structural integrity. Starts at Hull Rating (15). At 0: Taken Out.' },
    parentId: rootFolderId,
  });

  // --------------------------------------------------------------------------
  // 6. Command SP pool
  // --------------------------------------------------------------------------

  makeProp({
    type: 'attribute',
    attributeType: 'resource',
    variableName: 'commandSP',
    name: 'Command SP (this round)',
    baseValue: { calculation: '0' },
    decimal: false,
    description: { text: 'SP from Holden\'s Command roll. Reset to 0 each round. Any crew can spend these.' },
    parentId: rootFolderId,
  });

  // --------------------------------------------------------------------------
  // 7. Crew station stats — pre-set to Roci crew ability scores
  //    Holden: Communication 3 (Leadership)
  //    Alex:   Dexterity 3 (Piloting)
  //    Naomi:  Intelligence 3 (Engineering + EW)
  //    Amos:   Accuracy 2 (Gunnery)
  // --------------------------------------------------------------------------

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'crewAccuracy',
    name: 'Gunner — Accuracy (Amos)',
    baseValue: { calculation: '2' },
    decimal: false,
    description: { text: 'Amos Burton — Accuracy 2. Gunnery for rail guns and PDCs.' },
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'crewDexterity',
    name: 'Pilot — Dexterity (Alex)',
    baseValue: { calculation: '3' },
    decimal: false,
    description: { text: 'Alex Kamal — Dexterity 3. Evasion, range shifts, and piloting maneuvers.' },
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'crewIntelligence',
    name: 'Engineer — Intelligence (Naomi)',
    baseValue: { calculation: '3' },
    decimal: false,
    description: { text: 'Naomi Nagata — Intelligence 3. Damage Control and Electronic Warfare.' },
    parentId: rootFolderId,
  });

  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'crewCommunication',
    name: 'Commander — Communication (Holden)',
    baseValue: { calculation: '3' },
    decimal: false,
    description: { text: 'James Holden — Communication 3. Command roll each round.' },
    parentId: rootFolderId,
  });

  console.log('Created core stats, derived TNs, Ship HP, Command SP, and crew station stats');

  // --------------------------------------------------------------------------
  // 8. Weapon actions
  //    Rocinante: Rail guns + PDCs (no torpedoes in this config)
  // --------------------------------------------------------------------------

  // Rail Gun Attack (Medium range — Roci's primary offensive weapon)
  const railGunId = makeProp({
    type: 'action',
    name: 'Rail Gun Attack',
    actionType: 'free',
    description: { text: 'Medium range (range band 1+). TN = 11 + target\'s Sensors. On hit: 4d6 - target\'s Hull Rating.' },
    parentId: rootFolderId,
  });
  makeProp({
    type: 'roll',
    name: 'Gunnery Roll (Amos)',
    variableName: 'railGunGunnery',
    roll: { calculation: '3d6 + crewAccuracy' },
    parentId: railGunId,
  });
  makeProp({
    type: 'damage',
    name: 'Rail Gun Damage',
    damage: { calculation: '4d6' },
    parentId: railGunId,
  });

  // PDC Burst (Close range + point defense)
  const pdcId = makeProp({
    type: 'action',
    name: 'PDC Burst',
    actionType: 'free',
    description: { text: 'Close range attacks (band 2) OR intercept incoming torpedoes (Sensors vs TN 12 + enemy Sensors).' },
    parentId: rootFolderId,
  });
  makeProp({
    type: 'roll',
    name: 'Gunnery Roll (Amos)',
    variableName: 'pdcGunnery',
    roll: { calculation: '3d6 + crewAccuracy' },
    parentId: pdcId,
  });
  makeProp({
    type: 'damage',
    name: 'PDC Damage',
    damage: { calculation: '2d6' },
    parentId: pdcId,
  });

  // --------------------------------------------------------------------------
  // 9. Crew actions
  // --------------------------------------------------------------------------

  // Command (Holden)
  const commandId = makeProp({
    type: 'action',
    name: 'Command (Holden)',
    actionType: 'free',
    description: { text: 'Phase 1. Communication (Leadership) vs TN 11. SP = Drama Die. Set commandSP above.' },
    parentId: rootFolderId,
  });
  makeProp({
    type: 'roll',
    name: 'Leadership Roll',
    variableName: 'commandRoll',
    roll: { calculation: '3d6 + crewCommunication' },
    parentId: commandId,
  });

  // Evasion (Alex)
  const evasionId = makeProp({
    type: 'action',
    name: 'Evasion (Alex)',
    actionType: 'free',
    description: { text: 'Phase 5. Dexterity (Piloting) vs evasionTN. Set evasionTN = 10 + attacking ship\'s Sensors before rolling.' },
    parentId: rootFolderId,
  });
  makeProp({
    type: 'roll',
    name: 'Evasion Roll',
    variableName: 'evasionRoll',
    roll: { calculation: '3d6 + crewDexterity' },
    parentId: evasionId,
  });

  // Range Shift (Alex)
  const rangeShiftId = makeProp({
    type: 'action',
    name: 'Range Shift (Alex)',
    actionType: 'free',
    description: { text: 'Phase 2. Dexterity (Piloting) vs TN 11 + Maneuverability (+1 for Roci). Success: shift range band ±1.' },
    parentId: rootFolderId,
  });
  makeProp({
    type: 'roll',
    name: 'Piloting Roll',
    variableName: 'rangeShiftRoll',
    roll: { calculation: '3d6 + crewDexterity + maneuverability' },
    parentId: rangeShiftId,
  });

  // Electronic Warfare (Naomi)
  const ewId = makeProp({
    type: 'action',
    name: 'Electronic Warfare (Naomi)',
    actionType: 'free',
    description: { text: 'Phase 3. Intelligence (Technology) vs TN 11. EW Points = Drama Die value.' },
    parentId: rootFolderId,
  });
  makeProp({
    type: 'roll',
    name: 'EW Roll',
    variableName: 'ewRoll',
    roll: { calculation: '3d6 + crewIntelligence' },
    parentId: ewId,
  });

  // Damage Control (Naomi)
  const dcId = makeProp({
    type: 'action',
    name: 'Damage Control (Naomi)',
    actionType: 'free',
    description: { text: 'Phase 7. Intelligence (Engineering) Advanced Test TN 11, Threshold = Active Losses × 5.' },
    parentId: rootFolderId,
  });
  makeProp({
    type: 'roll',
    name: 'Engineering Roll',
    variableName: 'damageControlRoll',
    roll: { calculation: '3d6 + crewIntelligence' },
    parentId: dcId,
  });

  // Point Defense (Amos)
  const pdId = makeProp({
    type: 'action',
    name: 'Point Defense (Amos)',
    actionType: 'free',
    description: { text: 'Intercept torpedo. Sensors vs TN 12 + attacking ship Sensors.' },
    parentId: rootFolderId,
  });
  makeProp({
    type: 'roll',
    name: 'PDC Roll',
    variableName: 'pointDefenseRoll',
    roll: { calculation: '3d6 + sensors' },
    parentId: pdId,
  });

  console.log('Created weapon actions and crew actions');

  // --------------------------------------------------------------------------
  // 10. Loss condition toggles
  // --------------------------------------------------------------------------

  const lossDefs = [
    {
      name: 'LOSS: Engines Damaged',
      description: 'Cannot shift range. -2 to Piloting (crewDexterity). Naomi: Advanced Test to repair.',
      effects: [{ stat: 'crewDexterity', op: 'add', amount: '-2' }],
    },
    {
      name: 'LOSS: Sensors Damaged',
      description: '-2 Sensors → Attack TN and Evasion TN drop by 2 (auto-calculated).',
      effects: [{ stat: 'sensors', op: 'add', amount: '-2' }],
    },
    { name: 'LOSS: Weapons Disabled', description: 'One weapon offline (GM: rail guns or PDCs). Cannot use until repaired.', effects: [] },
    { name: 'LOSS: Hull Breach', description: 'Crew not in suits: 1d6/round. Seal with Damage Control or manual patch.', effects: [] },
    { name: 'LOSS: Collateral Damage', description: 'One crew member (attacker\'s choice) takes full weapon damage. Apply manually.', effects: [] },
    {
      name: 'LOSS: Comms Offline',
      description: 'Holden cannot use Leadership stunts. -3 to crewCommunication.',
      effects: [{ stat: 'crewCommunication', op: 'add', amount: '-3' }],
    },
    { name: 'LOSS: Life Support Damaged', description: 'Time pressure — limited rounds before atmosphere critical (GM sets count).', effects: [] },
  ];

  for (const lossDef of lossDefs) {
    const toggleId = makeProp({
      type: 'toggle',
      name: lossDef.name,
      description: { text: lossDef.description },
      showUI: true,
      parentId: rootFolderId,
    });
    for (const eff of lossDef.effects) {
      makeProp({
        type: 'effect',
        operation: eff.op,
        amount: { calculation: eff.amount },
        stats: [eff.stat],
        name: `${lossDef.name}: ${eff.stat} ${eff.amount}`,
        parentId: toggleId,
      });
    }
  }

  // Active Losses counter
  makeProp({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'lossCount',
    name: 'Active Losses',
    baseValue: { calculation: '0' },
    decimal: false,
    description: { text: 'Update manually. DC Threshold = this × 5. At 2+ when taking damage: Taken Out.' },
    parentId: rootFolderId,
  });

  // Taken Out
  makeProp({
    type: 'toggle',
    name: 'SHIP TAKEN OUT',
    description: { text: 'Rocinante is out of combat. Attacker chooses: Crippled / Helpless / Destroyed.' },
    showUI: true,
    parentId: rootFolderId,
  });

  // --------------------------------------------------------------------------
  // 11. Ship info note
  // --------------------------------------------------------------------------
  makeProp({
    type: 'note',
    name: 'Rocinante — Ship Data',
    description: { text: `MCRN Corvette-class light frigate, converted
Registry: Rocinante (formerly MCRN Tachi)
Commander: James Holden

CREW STATIONS:
• Holden (Commander) — Communication 3
• Alex Kamal (Pilot) — Dexterity 3
• Naomi Nagata (Engineer/EW) — Intelligence 3
• Amos Burton (Gunner) — Accuracy 2

ARMAMENT:
• 2× Rail gun batteries (medium range, 4d6)
• PDC array (close range / point defense, 2d6)
• NO torpedoes in standard loadout

COMBAT PROFILE:
• Preferred range: Medium (band 1) — rail gun effective
• Maneuverability: +1 (agile for a corvette)
• Sensors: 3 (military grade — hard to hit TN 14)
• Hull: 15 (well-armored for size)

MULTI-TAB SETUP:
Keep this ship sheet open. Open each crew character in separate tabs.
Update crew station stats if crew changes.` },
    parentId: rootFolderId,
  });

  console.log('Created Loss conditions, Active Losses, Taken Out, and Ship Data note');

  // --------------------------------------------------------------------------
  // 12. Insert all properties
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
  console.log('Sample Ship Created: Rocinante');
  console.log('========================================');
  console.log(`Creature ID: ${creatureId}`);
  console.log(`Game System: expanse-ship`);
  console.log(`Type: npc`);
  console.log('');
  console.log('Ship stats:');
  console.log('  Hull Rating:     15');
  console.log('  Sensors:          3   (Attack TN vs Roci = 14)');
  console.log('  Maneuverability: +1');
  console.log('  Ship HP:         15   (= hull)');
  console.log('');
  console.log('Crew pre-set:');
  console.log('  Holden (Commander): Communication 3');
  console.log('  Alex (Pilot):       Dexterity 3');
  console.log('  Naomi (Engineer):   Intelligence 3');
  console.log('  Amos (Gunner):      Accuracy 2');
  console.log('');
  console.log('View in UI at: http://localhost:3000/character/' + creatureId);

  return creatureId;
})();
