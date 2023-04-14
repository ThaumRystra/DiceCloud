import { triggerMatchTags } from '/imports/api/engine/actions/applyTriggers.js';
import clean from '/imports/api/engine/computation/utility/cleanProp.testFn.js';
import { assert } from 'chai';

export default function () {
  const prop = clean({
    id: 'propWithTags',
    type: 'action',
    tags: ['yes1', 'notUsed', 'no1', 'yes2', 'no2', 'or1', 'or2'],
  });
  const positiveProp = clean({
    id: 'propWithTags',
    type: 'action',
    tags: ['yes1', 'notUsed', 'yes2', 'or1', 'or2'],
  });
  assert.isTrue(
    triggerMatchTags(clean({
      type: 'trigger',
      targetTags: ['yes1'],
    }), prop),
    'Trigger matches on a single target tag'
  );
  assert.isTrue(
    triggerMatchTags(clean({
      type: 'trigger',
      targetTags: ['yes1', 'yes2'],
    }), prop),
    'Trigger matches on a multiple target tags'
  );
  assert.isFalse(
    triggerMatchTags(clean({
      type: 'trigger',
      targetTags: ['yes1'],
      extraTags: [{ operation: 'NOT', tags: ['no1'] }]
    }), prop),
    'Trigger correctly fails to match when not tags are present'
  );
  assert.isFalse(
    triggerMatchTags(clean({
      type: 'trigger',
      extraTags: [{ operation: 'NOT', tags: ['no1'] }]
    }), prop),
    'Trigger correctly fails to match when only not tags are present'
  );
  assert.isTrue(
    triggerMatchTags(clean({
      type: 'trigger',
      extraTags: [{ operation: 'NOT', tags: ['no1'] }]
    }), positiveProp),
    'Trigger matches when only not tags are present'
  );
  assert.isTrue(
    triggerMatchTags(clean({
      type: 'trigger',
      extraTags: [{ operation: 'OR', tags: ['or1'] }]
    }), positiveProp),
    'Trigger matches when OR tags are present'
  );
  assert.isTrue(
    triggerMatchTags(clean({
      type: 'trigger',
      targetTags: ['missing1'],
      extraTags: [{ operation: 'OR', tags: ['or1'] }]
    }), positiveProp),
    'Trigger matches when only OR tags are present'
  );
}