import { Migrations } from 'meteor/percolate:migrations';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import transformFields from '/imports/migrations/server/transformFields';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

// Git version 2.0-beta.33
// Database version 1
Migrations.add({
  version: 1,
  name: 'Unifies calculated field schema',
  up() {
    migrate();
  },
  down() {
    migrate({ reversed: true });
  },
});

function migrate({ reversed } = {}) {
  console.log('migrating creature properties');
  migrateCollection({ collection: CreatureProperties, reversed });

  console.log('migrating library nodes')
  migrateCollection({ collection: LibraryNodes, reversed });
}

function migrateCollection({ collection, reversed }) {
  const bulk = collection.rawCollection().initializeUnorderedBulkOp();
  collection.find({}).forEach(prop => {
    const newProp = migrateProperty({ collection, reversed, prop });
    bulk.find({ _id: prop._id }).replaceOne(newProp);
  });
  bulk.execute();
}

export function migrateProperty({ collection, reversed, prop }) {
  const transforms = [
    ...(transformsByPropType[prop.type] || []),
    { from: 'dependencies' }
  ];
  let migratedProp = transformFields(prop, transforms, reversed);
  const schema = collection.simpleSchema({ type: migratedProp.type });
  // Only clean if the schema version matches our destination version
  if (!reversed && SCHEMA_VERSION == 1) {
    try {
      migratedProp = schema.clean(migratedProp);
      schema.validate(migratedProp);
    } catch (e) {
      if (e.details[0]?.type === 'maxString') {

        console.log({
          prop: prop,
          details: e.details,
        });
      } else {
        console.warn({ prop, error: e });
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
    { from: 'target', to: 'target', up: simplifyTarget },
  ],
  'attack': [
    ...actionTransforms,
    ...getComputedPropertyTransforms('rollBonus', 'attackRoll'),
    //change type to action
    { from: 'type', to: 'type', up: () => 'action' },
    { from: 'results' },
  ],
  'attribute': [
    // from: baseValue must be first or else it will delete the field we need
    { from: 'baseValue', to: 'baseValue.value', up: nanToNull },
    { from: 'baseValueCalculation', to: 'baseValue.calculation', up: calculationUp, down: calculationDown },
    { from: 'baseValueErrors', to: 'baseValue.errors', up: trimErrors },
    ...getComputedPropertyTransforms('spellSlotLevel'),
    ...getInlineComputationTransforms('description'),
    { from: 'value', to: 'total', up: nanToNull },
    { from: 'currentValue', to: 'value', up: nanToNull },
    { from: 'proficiency', to: 'proficiency', up: stripZero },
  ],
  'buff': [
    ...getComputedPropertyTransforms('duration'),
    ...getInlineComputationTransforms('description'),
    { from: 'value', to: 'total', up: nanToNull },
    { from: 'target', to: 'target', up: simplifyTarget },
    { from: 'applied' },
  ],
  'classLevel': [
    ...getInlineComputationTransforms('description'),
  ],
  'container': [
    ...getInlineComputationTransforms('description'),
  ],
  'damage': [
    ...getComputedPropertyTransforms('amount'),
    { from: 'target', to: 'target', up: simplifyTarget },
  ],
  'effect': [
    { from: 'calculation', to: 'amount.calculation' },
    { from: 'result', to: 'amount.value', up: nanToNull },
    { from: 'errors', to: 'amount.errors', up: trimErrors },
    {
      from: 'name', to: 'name', up(val, src, doc) {
        if (src.operation === 'conditional') {
          doc.text = val;
          return;
        } else {
          return val;
        }
      }
    },
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
    { from: 'target', to: 'target', up: simplifyTarget },
  ],
  'skill': [
    ...getComputedPropertyTransforms('baseValue'),
    ...getInlineComputationTransforms('description'),
    { from: 'value', to: 'value', up: nanToNull },
    { from: 'passiveBonus', to: 'passiveBonus', up: nanToNull },
    { from: 'proficiency', to: 'proficiency', up: stripZero },
  ],
  'spell': [
    ...actionTransforms,
  ],
  'proficiency': [
    { from: 'value', to: 'value', up: stripZero },
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
    { from: 'condition', to: 'condition.calculation' },
    { from: 'toggleResult', to: 'condition.value', up: nanToNull },
    { from: 'errors', to: 'condition.errors', up: trimErrors },
  ],
};

function getComputedPropertyTransforms(key, toKey) {
  if (!toKey) toKey = key;
  return [
    { from: key, to: `${toKey}.calculation`, up: calculationUp, down: calculationDown },
    { from: `${key}Result`, to: `${toKey}.value`, up: nanToNull },
    { from: `${key}Errors`, to: `${toKey}.errors`, up: trimErrors },
  ];
}

function getInlineComputationTransforms(key) {
  return [
    { from: key, to: `${key}.text`, up: calculationUp, down: calculationDown },
    { from: `${key}Calculations`, to: `${key}.inlineCalculations`, up: calculationUp, down: calculationDown },
    { from: `${key}Calculations.$.result`, to: `${key}.inlineCalculations.$.value` },
  ];
}

export function calculationUp(val) {
  if (typeof val !== 'string') return val;
  if (!val.replace) console.log({ val, replace: val.replace });
  return val.replace(/#(\w+).(\w+)Result/g, '#$1.$2')
    .replace(/\.value/g, '.total')
    .replace(/\.currentValue/g, '.value');
}

function calculationDown(val) {
  if (typeof val !== 'string') return val;
  return val.replace(/\.value/g, '.currentValue').replace(/\.total/g, '.value');
}

function nanToNull(val) {
  if (Number.isNaN(val)) {
    return null;
  } else {
    return val;
  }
}

function stripZero(val) {
  if (val === 0) {
    return undefined;
  } else {
    return val;
  }
}

function simplifyTarget(val) {
  if (val === 'self') {
    return val;
  } else {
    return 'target';
  }
}

function trimErrors(arr) {
  if (!arr) return arr;
  arr.forEach(e => {
    if (e.message.length > STORAGE_LIMITS.errorMessage) {
      e.message = e.message.slice(0, STORAGE_LIMITS.errorMessage);
    }
  });
  return arr;
}
