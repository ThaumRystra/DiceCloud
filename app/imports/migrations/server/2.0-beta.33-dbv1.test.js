import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import migrateProperty from './2.0-beta.33-dbv1.js';
import { assert } from 'chai';

const exampleAction = {
   '_id':'hY5MKZ4ivaoTRpNWy',
   'actionType':'bonus',
   'target':'singleTarget',
   'tags':[],
   'resources':{
      'itemsConsumed':[],
      'attributesConsumed':[{
          '_id':'FaK6jXEj3pSe7mNuu',
          'quantity':1,
          'variableName':'HunterTech',
          'statId':'qccf9j5tfNJjZ3GGn',
          'statName':'Hunter\'s Technique',
          'available':5
       }],
   },
   'type':'action',
   'name':'Hexblade\\\'s Curse',
   'parent':{
      'id':'JqtDmqa5Zd3xpts5G',
      'collection':'creatureProperties'
   },
   'ancestors':[
      {
         'collection':'creatures',
         'id':'X9rzFhsgFhodYfHmG'
      },
   ],
   'order':315,
   'summary':'Curse a creature for 1 minute. The curse ends early if {warlock.level >14 ? "" : "the target dies, or"} you are incapacitated. \nGain the following benefits:  \n- *Bonus to damage rolls against the cursed target of* **+{proficiencyBonus}**. \n- Any attack roll you make against the cursed target is a **critical hit on a roll of 19 or 20**. \n- If the cursed target dies, you **regain {warlock.level+charisma.modifier} hit points**.  \n{warlock.level <9 ? "" : "- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses."}',
   'uses':'1',
   'usesResult':1,
   'reset':'shortRest',
   'usesUsed':0,
   'description':'Starting at 1st level, you gain the ability to place a baleful curse on someone. As a bonus action, choose one creature you can see within 30 feet of you. The target is cursed for 1 minute. The curse ends early if the target dies, you die, or you are incapacitated. Until the curse ends, you gain the following benefits:\n\n- You gain a bonus to damage rolls against the cursed target. The bonus equals your proficiency bonus.\n- Any attack roll you make against the cursed target is a critical hit on a roll of 19 or 20 on the d20.\n- If the cursed target dies, you regain hit points equal to your warlock level + your Charisma modifier (minimum of 1 hit point).  \n{warlock.level <10 ? "" :"- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses."}  \nYou can\\\'t use this feature again until you finish a short or long rest.',
   'color':'#8e24aa',
   'dependencies':[
      '4eM4YkgAaoCJfCfQ8',
   ],
   'descriptionCalculations':[
      {
         'calculation':'warlock.level <10 ? "" :"- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses."',
         'result':'- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses.'
      }
   ],
   'summaryCalculations':[
      {
         'calculation':'warlock.level >14 ? "" : "the target dies, or"',
         'result':'the target dies, or'
      },
      {
         'calculation':'proficiencyBonus',
         'result':'4'
      },
      {
         'calculation':'warlock.level+charisma.modifier',
         'result':'15'
      },
      {
         'calculation':'warlock.level <9 ? "" : "- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses."',
         'result':'- If you are hit with an attack by your cursed target, use your reaction to roll a d6. On a 4 or higher, the attack instead misses.'
      }
   ]
};

describe('migrateProperty', function () {
  it('Migrates actions reversibly', function () {
    const action = {...exampleAction};
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
});
