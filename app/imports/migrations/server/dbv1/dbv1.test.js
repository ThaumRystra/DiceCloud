import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import {
  migrateProperty
} from './dbv1';
import {
  assert
} from 'chai';
import LibraryNodes from '/imports/api/library/LibraryNodes';

const exampleAction = {
  '_id': 'hY5MKZ4ivaoTRpNWy',
  'actionType': 'bonus',
  'target': 'singleTarget',
  'tags': [],
  'resources': {
    'itemsConsumed': [],
    'attributesConsumed': [{
      '_id': 'FaK6jXEj3pSe7mNuu',
      'quantity': '1',
      'variableName': 'HunterTech',
      'statName': 'Hunter\'s Technique',
      'available': 5
    }],
  },
  'type': 'action',
  'name': 'Hexblade\\\'s Curse',
  'parent': {
    'id': 'JqtDmqa5Zd3xpts5G',
    'collection': 'creatureProperties'
  },
  'ancestors': [{
    'collection': 'creatures',
    'id': 'X9rzFhsgFhodYfHmG'
  },],
  'order': 315,
  'summary': 'Curse a creature for 1 minute. The curse ends early if {warlock.level >14 ? "" : "the target dies, or"} you are incapacitated. \nGain the following benefits:  \n- *Bonus to damage rolls against the cursed target of* **+{proficiencyBonus}**. \n- Any attack roll you make against the cursed target is a **critical hit on a roll of 19 or 20**. \n- If the cursed target dies, you **regain {warlock.level+charisma.modifier} hit points**.  \n{warlock.level <9 ? "" : "- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses."}',
  'uses': '1',
  'usesResult': 1,
  'reset': 'shortRest',
  'usesUsed': 0,
  'description': 'Starting at 1st level, you gain the ability to place a baleful curse on someone. As a bonus action, choose one creature you can see within 30 feet of you. The target is cursed for 1 minute. The curse ends early if the target dies, you die, or you are incapacitated. Until the curse ends, you gain the following benefits:\n\n- You gain a bonus to damage rolls against the cursed target. The bonus equals your proficiency bonus.\n- Any attack roll you make against the cursed target is a critical hit on a roll of 19 or 20 on the d20.\n- If the cursed target dies, you regain hit points equal to your warlock level + your Charisma modifier (minimum of 1 hit point).  \n{warlock.level <10 ? "" :"- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses."}  \nYou can\\\'t use this feature again until you finish a short or long rest.',
  'color': '#8e24aa',
  'descriptionCalculations': [{
    'calculation': 'warlock.level <10 ? "" :"- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses."',
    'result': '- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses.'
  }],
  'summaryCalculations': [{
    'calculation': 'warlock.level >14 ? "" : "the target dies, or"',
    'result': 'the target dies, or'
  },
  {
    'calculation': 'proficiencyBonus',
    'result': '4'
  },
  {
    'calculation': 'warlock.level+charisma.modifier',
    'result': '15'
  },
  {
    'calculation': 'warlock.level <9 ? "" : "- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses."',
    'result': '- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses.'
  }
  ]
};

const exampleAttribute = {
  _id: 'idRWyoj5oxCv73feM',
  name: 'Hit Dice',
  variableName: 'clericHitDice',
  attributeType: 'hitDice',
  type: 'attribute',
  hitDiceSize: 'd8',
  baseValueCalculation: 'cleric.level',
  parent: {
    'id': '8jSWKxvgQyKbunFtD',
    'collection': 'creatureProperties'
  },
  ancestors: [{
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv'
  },
  {
    'id': '8jSWKxvgQyKbunFtD',
    'collection': 'creatureProperties'
  }
  ],
  order: 84,
  value: 20,
  tags: [],
  baseValue: 20,
  damage: 3,
  currentValue: 17,
  constitutionMod: 2,
  dependencies: ['8jSWKxvgQyKbunFtD', 'qPP5yQXPxS7uhuXo3']
};

const expectedMigratedAttribute = {
  _id: 'idRWyoj5oxCv73feM',
  name: 'Hit Dice',
  variableName: 'clericHitDice',
  attributeType: 'hitDice',
  type: 'attribute',
  hitDiceSize: 'd8',
  baseValue: {
    calculation: 'cleric.level',
    value: 20
  },
  parent: {
    'id': '8jSWKxvgQyKbunFtD',
    'collection': 'creatureProperties'
  },
  ancestors: [{
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv'
  },
  {
    'id': '8jSWKxvgQyKbunFtD',
    'collection': 'creatureProperties'
  }
  ],
  order: 84,
  total: 20,
  tags: [],
  damage: 3,
  value: 17,
  constitutionMod: 2,
}

const exampleAttack = {
  '_id': 'vw23EnJwBRcXEJg7i',
  'actionType': 'attack',
  'target': 'singleTarget',
  'tags': ['attack'],
  'results': {
    'adjustments': [],
    'damages': [{
      '_id': 'RGJMeNJXBeqZsGmAw',
      'damage': '1d4 + strength.modifier',
      'target': 'every',
      'damageType': 'slashing'
    }],
    'buffs': []
  },
  'resources': {
    'itemsConsumed': [],
    'attributesConsumed': []
  },
  'rollBonus': 'dexterity.modifier + proficiencyBonus + 2 - hp.value + hp.currentValue',
  'type': 'attack',
  'name': 'Claws',
  'parent': {
    'id': 'Jpx8q3WjM5SCoGBm8',
    'collection': 'creatureProperties'
  },
  'ancestors': [{
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv'
  }, {
    'id': '3WS2xsSPAqB4eF9YH',
    'collection': 'creatureProperties'
  }, {
    'id': 'rhYLEycvtHjcioaQL',
    'collection': 'creatureProperties'
  }, {
    'id': 'Jpx8q3WjM5SCoGBm8',
    'collection': 'creatureProperties'
  }],
  'order': 56,
  'rollBonusResult': 6,
  'usesUsed': 2,
  'dependencies': ['pg6cK5ghHTFvo8uyK', 'gAJBKYqXz2BPc9Aqf']
}

const expectedMigratedAttack = {
  '_id': 'vw23EnJwBRcXEJg7i',
  'actionType': 'attack',
  'target': 'singleTarget',
  'tags': ['attack'],
  'resources': {
    'itemsConsumed': [],
    'attributesConsumed': []
  },
  'attackRoll': {
    calculation: 'dexterity.modifier + proficiencyBonus + 2 - hp.total + hp.value',
    value: 6,
  },
  'type': 'action',
  'name': 'Claws',
  'parent': {
    'id': 'Jpx8q3WjM5SCoGBm8',
    'collection': 'creatureProperties'
  },
  'ancestors': [{
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv'
  }, {
    'id': '3WS2xsSPAqB4eF9YH',
    'collection': 'creatureProperties'
  }, {
    'id': 'rhYLEycvtHjcioaQL',
    'collection': 'creatureProperties'
  }, {
    'id': 'Jpx8q3WjM5SCoGBm8',
    'collection': 'creatureProperties'
  }],
  'order': 56,
  'usesUsed': 2,
}

describe('migrateProperty', function () {
  return;
  it('Migrates actions reversibly', function () {
    const action = {
      ...exampleAction
    };
    const newAction = migrateProperty({
      collection: CreatureProperties,
      prop: action
    });
    const reversedAction = migrateProperty({
      collection: CreatureProperties,
      prop: newAction,
      reversed: true,
    });
    assert.deepEqual(action, exampleAction, 'action should not be bashed');
    assert.deepEqual(exampleAction, reversedAction, 'operation should be reversible');
  });
  it('Migrates attributes as expected', function () {
    const attribute = {
      ...exampleAttribute
    };
    const newAttribute = migrateProperty({
      collection: CreatureProperties,
      prop: attribute
    });
    assert.deepEqual(newAttribute, expectedMigratedAttribute,
      'Attribute should match the expected result');
  });
  it('Migrates attacks as expected', function () {
    const attack = {
      ...exampleAttack
    };
    const newAttack = migrateProperty({
      collection: LibraryNodes,
      prop: attack
    });
    assert.deepEqual(newAttack, expectedMigratedAttack,
      'Attack should match the expected result');
  });
});
