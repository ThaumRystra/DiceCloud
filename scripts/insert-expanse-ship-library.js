/**
 * The Expanse RPG — Ship Combat Library
 *
 * VH-003b: Ships as separate creatures with their own stat block.
 * Ships use gameSystem: 'expanse-ship' and get a dedicated tab layout
 * (Ship Systems, Combat, Crew Roles, Ship Log, Build).
 *
 * Key design choices:
 * - Ships are separate Creature documents (type: 'npc') with gameSystem 'expanse-ship'
 * - Crew station stats on the ship sheet are set to crew member ability scores before combat
 * - Loss conditions are toggles that cascade into TN penalties (sensors, dexterity penalties)
 * - Multi-tab workflow: ship sheet open in one tab, each crew member in a separate tab
 *
 * Usage:
 *   cd app
 *   meteor shell
 *   > .load ../scripts/insert-expanse-ship-library.js
 */

// ============================================================================
// Configuration
// ============================================================================

const OWNER_ID = null; // null = use first user found

// ============================================================================
// Imports
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

(function insertExpanseShipLibrary() {
  const ownerId = getOwnerId();

  // --------------------------------------------------------------------------
  // 1. Create the Library document
  // --------------------------------------------------------------------------
  const libraryId = id();

  Libraries.insert({
    _id: libraryId,
    name: 'The Expanse RPG — Ship',
    description: 'Ship combat stat block for The Expanse RPG. ' +
      'Ships are separate Creature documents with gameSystem "expanse-ship". ' +
      'Includes core ship stats (Hull, Sensors, Maneuverability), derived TNs, ' +
      'crew station stats, weapon actions (torpedoes, rail guns, PDCs), ' +
      'crew role actions, and Loss condition toggles.',
    gameSystem: 'expanse-ship',
    owner: ownerId,
    readers: [],
    writers: [],
    public: true,
    readersCanCopy: true,
  });

  console.log(`Created library: ${libraryId} — "The Expanse RPG — Ship"`);

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
  // 2. Root node — tagged 'ship' (NOT 'base' — ships are not characters)
  // --------------------------------------------------------------------------
  const rootNodeId = makeNode({
    type: 'folder',
    name: 'Ship Combat Stats',
    fillSlots: true,
    libraryTags: ['ship'],
  });

  // --------------------------------------------------------------------------
  // 3. Core ship stats
  // --------------------------------------------------------------------------

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'hull',
    name: 'Hull Rating',
    baseValue: { calculation: '10' },
    decimal: false,
    description: { text: 'Hull Rating subtracts from incoming damage. Set to the average of your hull dice (e.g., 10 for 3d6). Larger/more armored ships have higher Hull.' },
    parentId: rootNodeId,
  });

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'sensors',
    name: 'Sensors',
    baseValue: { calculation: '2' },
    decimal: false,
    description: { text: 'Sensor rating. Adds to Attack TN (harder to hit you) and affects Evasion TN. Typical range: 1–4.' },
    parentId: rootNodeId,
  });

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'maneuverability',
    name: 'Maneuverability',
    baseValue: { calculation: '0' },
    decimal: false,
    description: { text: 'Maneuverability bonus/penalty to Piloting range-shift tests. Typical range: -2 to +2. Agile ships: +1 or +2. Freighters: -1 or -2.' },
    parentId: rootNodeId,
  });

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'rangeBand',
    name: 'Range Band',
    baseValue: { calculation: '0' },
    decimal: false,
    description: { text: 'Current range to primary target. 0 = Long (torpedoes only), 1 = Medium (rail guns + torpedoes), 2 = Close (all weapons including PDCs).' },
    parentId: rootNodeId,
  });

  console.log('Created 4 core ship stats (Hull, Sensors, Maneuverability, Range Band)');

  // --------------------------------------------------------------------------
  // 4. Derived TNs
  // --------------------------------------------------------------------------

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'attackTN',
    name: 'Attack TN (vs this ship)',
    baseValue: { calculation: '11 + sensors' },
    decimal: false,
    description: { text: 'TN enemy gunners must beat to hit this ship. = 11 + this ship\'s Sensors. Set on the TARGET ship\'s sheet before combat.' },
    parentId: rootNodeId,
  });

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'evasionTN',
    name: 'Evasion TN',
    baseValue: { calculation: '10 + sensors' },
    decimal: false,
    description: { text: 'TN for evasion rolls. Before an evasion roll, set this to 10 + the ATTACKING ship\'s Sensor score (not your own). The pilot rolls 3d6 + Dexterity vs this TN.' },
    parentId: rootNodeId,
  });

  console.log('Created 2 derived TNs (Attack TN, Evasion TN)');

  // --------------------------------------------------------------------------
  // 5. Ship HP (Hull Points)
  // --------------------------------------------------------------------------

  makeNode({
    type: 'attribute',
    attributeType: 'healthBar',
    variableName: 'shipHP',
    name: 'Ship Hull Points',
    baseValue: { calculation: 'hull' },
    decimal: false,
    description: { text: 'Remaining structural integrity. Starts equal to Hull Rating. When reduced to 0: Taken Out. Incoming damage = weapon damage - Hull Rating (minimum 0 damage per hit).' },
    parentId: rootNodeId,
  });

  console.log('Created Ship HP (health bar)');

  // --------------------------------------------------------------------------
  // 6. Command SP pool (reset each round)
  // --------------------------------------------------------------------------

  makeNode({
    type: 'attribute',
    attributeType: 'resource',
    variableName: 'commandSP',
    name: 'Command SP (this round)',
    baseValue: { calculation: '0' },
    decimal: false,
    description: { text: 'Stunt Points from the Commander\'s Leadership roll this round. Any crew member can spend these. Reset to 0 at the start of each new round.' },
    parentId: rootNodeId,
  });

  // --------------------------------------------------------------------------
  // 7. Crew station stats (set to crew member ability scores before combat)
  // --------------------------------------------------------------------------

  const crewStats = [
    { variableName: 'crewAccuracy',      name: 'Gunner — Accuracy',        description: 'Set to the Gunner\'s Accuracy score before combat begins. Used in all weapon attack rolls.' },
    { variableName: 'crewDexterity',     name: 'Pilot — Dexterity',        description: 'Set to the Pilot\'s Dexterity score before combat begins. Used in evasion and range shift rolls.' },
    { variableName: 'crewIntelligence',  name: 'Engineer — Intelligence',   description: 'Set to the Engineer\'s Intelligence score. Used in Electronic Warfare and Damage Control rolls.' },
    { variableName: 'crewCommunication', name: 'Commander — Communication', description: 'Set to the Commander\'s Communication score. Used in the Leadership (Command) roll each round.' },
  ];

  for (const stat of crewStats) {
    makeNode({
      type: 'attribute',
      attributeType: 'stat',
      variableName: stat.variableName,
      name: stat.name,
      baseValue: { calculation: '0' },
      decimal: false,
      description: { text: stat.description },
      parentId: rootNodeId,
    });
  }

  console.log(`Created ${crewStats.length} crew station stats`);

  // --------------------------------------------------------------------------
  // 8. Weapon actions
  // --------------------------------------------------------------------------

  // Torpedo Attack (Long range)
  const torpedoId = makeNode({
    type: 'action',
    name: 'Torpedo Attack',
    actionType: 'free',
    description: { text: 'Long range only (range band 0+). TN = 11 + enemy Sensors. Torpedoes can be intercepted by enemy PDCs. On hit: apply damage - enemy Hull Rating.' },
    parentId: rootNodeId,
  });
  makeNode({
    type: 'roll',
    name: 'Gunnery Roll',
    variableName: 'torpedoGunnery',
    roll: { calculation: '3d6 + crewAccuracy' },
    parentId: torpedoId,
  });
  makeNode({
    type: 'damage',
    name: 'Torpedo Damage',
    damage: { calculation: '3d6 + 3' },
    parentId: torpedoId,
  });

  // Rail Gun Attack (Medium range)
  const railGunId = makeNode({
    type: 'action',
    name: 'Rail Gun Attack',
    actionType: 'free',
    description: { text: 'Medium range (range band 1+). TN = 11 + enemy Sensors. Cannot be intercepted. On hit: apply damage - enemy Hull Rating.' },
    parentId: rootNodeId,
  });
  makeNode({
    type: 'roll',
    name: 'Gunnery Roll',
    variableName: 'railGunGunnery',
    roll: { calculation: '3d6 + crewAccuracy' },
    parentId: railGunId,
  });
  makeNode({
    type: 'damage',
    name: 'Rail Gun Damage',
    damage: { calculation: '4d6' },
    parentId: railGunId,
  });

  // PDC Burst (Close range + point defense)
  const pdcId = makeNode({
    type: 'action',
    name: 'PDC Burst',
    actionType: 'free',
    description: { text: 'Close range attacks (range band 2) OR point defense vs incoming torpedoes (Sensors vs TN 12 + attacking ship Sensors). On attack hit: apply damage - enemy Hull.' },
    parentId: rootNodeId,
  });
  makeNode({
    type: 'roll',
    name: 'Gunnery Roll',
    variableName: 'pdcGunnery',
    roll: { calculation: '3d6 + crewAccuracy' },
    parentId: pdcId,
  });
  makeNode({
    type: 'damage',
    name: 'PDC Damage',
    damage: { calculation: '2d6' },
    parentId: pdcId,
  });

  console.log('Created 3 weapon actions (Torpedo, Rail Gun, PDC)');

  // --------------------------------------------------------------------------
  // 9. Crew actions
  // --------------------------------------------------------------------------

  // Command
  const commandId = makeNode({
    type: 'action',
    name: 'Command',
    actionType: 'free',
    description: { text: 'Phase 1 of each combat round. Commander rolls Communication (Leadership) vs TN 11. Success: generate Stunt Points equal to the Drama Die value. Set commandSP on this sheet.' },
    parentId: rootNodeId,
  });
  makeNode({
    type: 'roll',
    name: 'Leadership Roll',
    variableName: 'commandRoll',
    roll: { calculation: '3d6 + crewCommunication' },
    parentId: commandId,
  });

  // Evasion
  const evasionId = makeNode({
    type: 'action',
    name: 'Evasion',
    actionType: 'free',
    description: { text: 'Phase 5 (Defensive Actions). Pilot rolls Dexterity (Piloting) vs evasionTN. Before rolling: set evasionTN on this sheet to 10 + the attacking ship\'s Sensors.' },
    parentId: rootNodeId,
  });
  makeNode({
    type: 'roll',
    name: 'Evasion Roll',
    variableName: 'evasionRoll',
    roll: { calculation: '3d6 + crewDexterity' },
    parentId: evasionId,
  });

  // Range Shift
  const rangeShiftId = makeNode({
    type: 'action',
    name: 'Range Shift',
    actionType: 'free',
    description: { text: 'Phase 2 (Maneuvers). Pilot rolls Dexterity (Piloting) vs TN 11 ± Maneuverability modifier. Success: shift range band by 1 (toward or away from target). Update rangeBand.' },
    parentId: rootNodeId,
  });
  makeNode({
    type: 'roll',
    name: 'Piloting Roll',
    variableName: 'rangeShiftRoll',
    roll: { calculation: '3d6 + crewDexterity + maneuverability' },
    parentId: rangeShiftId,
  });

  // Electronic Warfare
  const ewId = makeNode({
    type: 'action',
    name: 'Electronic Warfare',
    actionType: 'free',
    description: { text: 'Phase 3 (Electronic Warfare). EW Officer rolls Intelligence (Technology) vs TN 11. Success: generate EW Points equal to the Drama Die value. Spend EW Points for various tactical effects.' },
    parentId: rootNodeId,
  });
  makeNode({
    type: 'roll',
    name: 'EW Roll',
    variableName: 'ewRoll',
    roll: { calculation: '3d6 + crewIntelligence' },
    parentId: ewId,
  });

  // Damage Control
  const damageControlId = makeNode({
    type: 'action',
    name: 'Damage Control',
    actionType: 'free',
    description: { text: 'Phase 7 (Damage Control). Engineer runs an Advanced Test: Intelligence (Engineering) TN 11, Threshold = Active Losses × 5. Completing the test removes one active Loss condition.' },
    parentId: rootNodeId,
  });
  makeNode({
    type: 'roll',
    name: 'Engineering Roll',
    variableName: 'damageControlRoll',
    roll: { calculation: '3d6 + crewIntelligence' },
    parentId: damageControlId,
  });

  // Point Defense
  const pointDefenseId = makeNode({
    type: 'action',
    name: 'Point Defense',
    actionType: 'free',
    description: { text: 'Intercept an incoming torpedo. Roll Sensors vs TN 12 + attacking ship\'s Sensors. Success: torpedo is destroyed before impact. Uses a PDC battery (cannot also fire PDCs offensively this phase).' },
    parentId: rootNodeId,
  });
  makeNode({
    type: 'roll',
    name: 'PDC Roll',
    variableName: 'pointDefenseRoll',
    roll: { calculation: '3d6 + sensors' },
    parentId: pointDefenseId,
  });

  console.log('Created 6 crew actions (Command, Evasion, Range Shift, EW, Damage Control, Point Defense)');

  // --------------------------------------------------------------------------
  // 10. Loss condition toggles (7 conditions)
  // --------------------------------------------------------------------------

  // LOSS: Engines Damaged
  const enginesDamagedId = makeNode({
    type: 'toggle',
    name: 'LOSS: Engines Damaged',
    description: { text: 'Cannot shift range bands this combat. -2 to all Piloting tests (applies to Pilot\'s crewDexterity for range shift and evasion calculations).' },
    showUI: true,
    parentId: rootNodeId,
  });
  makeNode({
    type: 'effect',
    operation: 'add',
    amount: { calculation: '-2' },
    stats: ['crewDexterity'],
    name: 'Engines Damaged: -2 to Piloting',
    parentId: enginesDamagedId,
  });

  // LOSS: Sensors Damaged
  const sensorsDamagedId = makeNode({
    type: 'toggle',
    name: 'LOSS: Sensors Damaged',
    description: { text: '-2 to Sensor score. Reduces Attack TN and Evasion TN by 2 (auto-calculated via sensor stat). Makes you easier to hit and harder to evade.' },
    showUI: true,
    parentId: rootNodeId,
  });
  makeNode({
    type: 'effect',
    operation: 'add',
    amount: { calculation: '-2' },
    stats: ['sensors'],
    name: 'Sensors Damaged: -2 Sensors',
    parentId: sensorsDamagedId,
  });

  // LOSS: Weapons Disabled
  makeNode({
    type: 'toggle',
    name: 'LOSS: Weapons Disabled',
    description: { text: 'One weapon system is offline (GM specifies which: torpedoes, rail guns, or PDCs). Cannot use that weapon until repaired. Toggle off when Damage Control removes this Loss.' },
    showUI: true,
    parentId: rootNodeId,
  });

  // LOSS: Hull Breach
  makeNode({
    type: 'toggle',
    name: 'LOSS: Hull Breach',
    description: { text: 'Atmosphere is venting. Crew not in pressure suits takes 1d6 damage per round (apply manually). Can be sealed with Damage Control or emergency patching. Toggle off when resolved.' },
    showUI: true,
    parentId: rootNodeId,
  });

  // LOSS: Collateral Damage
  makeNode({
    type: 'toggle',
    name: 'LOSS: Collateral Damage',
    description: { text: 'One crew member (attacker\'s choice) takes full weapon damage. Mark which crew member was hit, then resolve damage on that character\'s sheet manually.' },
    showUI: true,
    parentId: rootNodeId,
  });

  // LOSS: Comms Offline
  const commsOfflineId = makeNode({
    type: 'toggle',
    name: 'LOSS: Comms Offline',
    description: { text: 'Internal and external comms are down. Commander cannot use Leadership stunts (no Command SP generated). -3 to Communication rolls for coordination.' },
    showUI: true,
    parentId: rootNodeId,
  });
  makeNode({
    type: 'effect',
    operation: 'add',
    amount: { calculation: '-3' },
    stats: ['crewCommunication'],
    name: 'Comms Offline: -3 to Communication',
    parentId: commsOfflineId,
  });

  // LOSS: Life Support Damaged
  makeNode({
    type: 'toggle',
    name: 'LOSS: Life Support Damaged',
    description: { text: 'Time pressure: crew has a limited number of rounds before atmosphere becomes critical (GM sets threshold). Adds urgency to Damage Control priority.' },
    showUI: true,
    parentId: rootNodeId,
  });

  console.log('Created 7 Loss condition toggles');

  // --------------------------------------------------------------------------
  // 11. Loss counter
  // --------------------------------------------------------------------------

  makeNode({
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'lossCount',
    name: 'Active Losses',
    baseValue: { calculation: '0' },
    decimal: false,
    description: { text: 'Number of active Loss conditions. Update manually as conditions are gained/removed. Damage Control threshold = Active Losses × 5. At 2+ Losses when further damage occurs: ship is Taken Out.' },
    parentId: rootNodeId,
  });

  // SHIP TAKEN OUT toggle
  makeNode({
    type: 'toggle',
    name: 'SHIP TAKEN OUT',
    description: { text: 'Ship is out of combat. Attacker chooses outcome:\n• Crippled — adrift and helpless, crew survives\n• Helpless — can be boarded (use for capture scenarios)\n• Destroyed — total loss, crew must escape pods or die' },
    showUI: true,
    parentId: rootNodeId,
  });

  console.log('Created Active Losses counter + Taken Out toggle');

  // --------------------------------------------------------------------------
  // 12. Ship Combat Reference Note
  // --------------------------------------------------------------------------

  makeNode({
    type: 'note',
    name: 'Ship Combat Reference',
    description: { text: `ROUND STRUCTURE (7 phases):

1. COMMAND — Commander: Communication (Leadership) TN 11. SP = Drama Die value. Any crew can spend.
2. MANEUVERS — Pilot: Dexterity (Piloting) TN 11 ± Maneuverability to shift 1 range band. High-G burn: +2 evasion this round, but all crew make CON TN 13 or take 1d6.
3. ELECTRONIC WARFARE — EW Officer: Intelligence (Technology) TN 11. EW Points = Drama Die.
4. WEAPON ATTACKS — Gunner: Accuracy (Gunnery) vs TN 11 + target\'s Sensors. Damage = weapon - target\'s Hull.
5. DEFENSIVE ACTIONS — Pilot: Dexterity (Piloting) vs evasionTN (= 10 + attacking ship Sensors). OR PDC intercept vs TN 12 + attacking Sensors.
6. ATTACK DAMAGE — Apply damage. Each active Loss reduces by 1d6 (max 2). If remaining > 0: additional Loss. At 2+ Losses when taking damage: Taken Out.
7. DAMAGE CONTROL — Engineer: Intelligence (Engineering) Advanced Test TN 11. Threshold = Active Losses × 5.

MULTI-TAB WORKFLOW:
• Open ship sheet in one browser tab
• Open each crew character sheet in separate tabs
• Before combat: set crewAccuracy, crewDexterity, crewIntelligence, crewCommunication to crew stats
• Run all rolls from the ship sheet during combat` },
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
  console.log('Expanse Ship Library Insertion Complete!');
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
  console.log('1. Create a new creature with gameSystem: "expanse-ship", type: "npc"');
  console.log('2. Fill its Ruleset slot (or add properties manually from this library)');
  console.log('3. Set Hull, Sensors, Maneuverability for the specific ship');
  console.log('4. Before combat: set crew station stats to crew member scores');
  console.log('5. See scripts/create-expanse-sample-ship.js for the Rocinante pre-built');

  return libraryId;
})();
