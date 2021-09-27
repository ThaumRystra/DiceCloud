import { Migrations } from 'meteor/percolate:migrations';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { get } from 'lodash';
import embedInlineCalculations from '/imports/api/creature/computation/afterComputation/embedInlineCalculations.js';
import transformFields from '/imports/migrations/server/transformFields.js';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION.js';

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
  const transforms = transformsByPropType[prop.type];
  let migratedProp = transformFields(prop, transforms, reversed);
  const schema = collection.simpleSchema({type: prop.type});
  // Only clean if the schema version matches our destination version
  if(!reversed  && SCHEMA_VERSION === 1){
    try {
      migratedProp = schema.clean(migratedProp);
      schema.validate(migratedProp);
    } catch(e){
      console.warn(e);
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
    {from: 'value', to: 'total'},
  ],
  'buff': [
    ...getComputedPropertyTransforms('duration'),
    ...getComputedPropertyTransforms('spellSlotLevel'),
    ...getInlineComputationTransforms('description'),
    {from: 'value', to: 'total'},
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
    {from: 'result', to: 'amount.value'},
    {from: 'errors', to: 'amount.errors'},
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
    {from: 'toggleResult', to: 'condition.value'},
    {from: 'errors', to: 'condition.errors'},
  ],
};

function getComputedPropertyTransforms(key){
  return [
    {from: key, to: `${key}.calculation`},
    {from: `${key}Result`, to: `${key}.value`},
    {from: `${key}Errors`, to: `${key}.errors`},
  ];
}

function getInlineComputationTransforms(key){
  return [
    {from: key, to: `${key}.text`},
    {from: `${key}Calculations`, to: `${key}.inlineCalculations`},
    {to: `${key}.value`, up: (val, doc) =>
      embedInlineCalculations(get(doc, key), get(doc, `${key}Calculations`))
    },
    {from: `${key}Calculations.$.result`, to: `${key}.inlineCalculations.$.value`},
  ];
}
