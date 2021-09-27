import { Migrations } from 'meteor/percolate:migrations';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import transformFields from '/imports/migrations/server/transformFields.js';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Git version 2.0-beta.33
// Database version 1
Migrations.add({
  version: 1,
  name: 'Unifies calculated field schema',
  up(){
    migrate();
  },
  down(){
    migrate({reversed: true});
  },
});

function migrate({reversed} = {}){
  migrateCollection({collection: CreatureProperties, reversed});
  migrateCollection({collection: LibraryNodes, reversed});
}

function migrateCollection({collection, reversed}){
  const bulk = collection.rawCollection().initializeUnorderedBulkOp();
  collection.find({}).forEach(prop => {
    const newProp = migrateProperty({collection, reversed, prop});
    bulk.find({ _id: prop._id }).replaceOne(newProp);
  });
  bulk.execute();
}

export default function migrateProperty({collection, reversed, prop}){
  const transforms = [
    ...(transformsByPropType[prop.type] || []),
    {from: 'dependencies'}
  ];
  let migratedProp = transformFields(prop, transforms, reversed);
  const schema = collection.simpleSchema({type: prop.type});
  // Only clean if the schema version matches our destination version
  if(!reversed  && SCHEMA_VERSION === 1){
    try {
      migratedProp = schema.clean(migratedProp);
      schema.validate(migratedProp);
    } catch(e){
      if (e.details[0]?.type === 'maxString'){

        console.log({
          prop: prop,
          details: e.details,
        });
      } else {
        console.warn({prop, error: e});
      }
    }
  }
  return migratedProp;
}

const actionTransforms = [
  ...getComputedPropertyTransforms('uses'),
  ...getComputedPropertyTransforms('resources.attributesConsumed.$.quantity'),
  ...getComputedPropertyTransforms('resources.itemsConsumed.$.quantity'),
  ...getInlineComputationTransforms('summary'),
  ...getInlineComputationTransforms('description'),
];

const transformsByPropType = {
  'action': actionTransforms,
  'adjustment': [
    ...getComputedPropertyTransforms('amount'),
  ],
  'attack': [
    ...actionTransforms,
    ...getComputedPropertyTransforms('rollBonus'),
  ],
  'attribute': [
    ...getComputedPropertyTransforms('baseValue'),
    ...getComputedPropertyTransforms('spellSlotLevel'),
    ...getInlineComputationTransforms('description'),
    {from: 'value', to: 'total', up: nanToNull},
    {from: 'proficiency', to: 'proficiency', up: stripZero},
  ],
  'buff': [
    ...getComputedPropertyTransforms('duration'),
    ...getInlineComputationTransforms('description'),
    {from: 'value', to: 'total', up: nanToNull},
  ],
  'classLevel': [
    ...getInlineComputationTransforms('description'),
  ],
  'container': [
    ...getInlineComputationTransforms('description'),
  ],
  'damage': [
    ...getComputedPropertyTransforms('amount'),
  ],
  'effect': [
    {from: 'calculation', to: 'amount.calculation'},
    {from: 'result', to: 'amount.value', up: nanToNull},
    {from: 'errors', to: 'amount.errors', up: trimErrors},
    {from: 'name', to: 'name', up(val, src, doc){
      if (src.operation === 'conditional'){
        doc.text = val;
        return;
      } else {
        return val;
      }
    }},
  ],
  'feature': [
    ...getInlineComputationTransforms('summary'),
    ...getInlineComputationTransforms('description'),
  ],
  'item': [
    ...getInlineComputationTransforms('description'),
  ],
  'note': [
    ...getInlineComputationTransforms('summary'),
    ...getInlineComputationTransforms('description'),
  ],
  'roll': [
    ...getComputedPropertyTransforms('roll'),
  ],
  'savingThrow': [
    ...getComputedPropertyTransforms('dc'),
  ],
  'skill': [
    ...getComputedPropertyTransforms('baseValue'),
    ...getInlineComputationTransforms('description'),
    {from: 'value', to: 'value', up: nanToNull},
    {from: 'passiveBonus', to: 'passiveBonus', up: nanToNull},
    {from: 'proficiency', to: 'proficiency', up: stripZero},
  ],
  'spell': [
    ...actionTransforms,
  ],
  'proficiency': [
    {from: 'value', to: 'value', up: stripZero},
  ],
  'propertySlot': [
    ...getComputedPropertyTransforms('quantityExpected'),
    ...getComputedPropertyTransforms('slotCondition'),
    ...getInlineComputationTransforms('description'),
  ],
  'spellList': [
    ...getComputedPropertyTransforms('maxPrepared'),
    ...getComputedPropertyTransforms('dc'),
    ...getComputedPropertyTransforms('attackRollBonus'),
    ...getInlineComputationTransforms('description'),
  ],
  'toggle': [
    {from: 'condition', to: 'condition.calculation'},
    {from: 'toggleResult', to: 'condition.value', up: nanToNull},
    {from: 'errors', to: 'condition.errors', up: trimErrors},
  ],
};

function getComputedPropertyTransforms(key){
  return [
    {from: key, to: `${key}.calculation`},
    {from: `${key}Result`, to: `${key}.value`, up: nanToNull},
    {from: `${key}Errors`, to: `${key}.errors`, up: trimErrors},
  ];
}

function getInlineComputationTransforms(key){
  return [
    {from: key, to: `${key}.text`},
    {from: `${key}Calculations`, to: `${key}.inlineCalculations`},
    {from: `${key}Calculations.$.result`, to: `${key}.inlineCalculations.$.value`},
  ];
}

function nanToNull(val){
  if (Number.isNaN(val)){
    return null;
  } else {
    return val;
  }
}

function stripZero(val){
  if (val === 0){
    return undefined;
  } else {
    return val;
  }
}

function trimErrors(arr){
  if(!arr) return arr;
  arr.forEach(e => {
    if (e.message.length > STORAGE_LIMITS.errorMessage){
      e.message = e.message.slice(0, STORAGE_LIMITS.errorMessage);
    }
  });
  return arr;
}
