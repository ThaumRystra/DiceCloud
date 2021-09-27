import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  const hasLink = computation.dependencyGraph.hasLink;
  assert.include(
    computation.propsById['conditionToggleChildId']._computationDetails.toggleAncestors,
    computation.propsById['conditionToggleId'],
    'Children of toggles should store a reference to their toggle ancestor'
  )
  assert.isTrue(
    !!hasLink('conditionToggleChildId', 'conditionToggleId'),
    'Children of the condition toggle should depend on it'
  );
  assert.isTrue(
    !!hasLink('conditionToggleGrandChildId', 'conditionToggleId'),
    'Descendants of the condition toggle should depend on it'
  );
  assert.isFalse(
    !!hasLink('disabledToggleId', 'disabledToggleChildId'),
    'The dependency should not be reversed'
  );
  assert.isFalse(
    !!hasLink('disabledToggleChildId', 'disabledToggleId'),
    'Children of disabled toggle should not depend on it'
  );
  assert.isFalse(
    !!hasLink('enabledToggleChildId', 'enabledToggleId'),
    'Children of enabled toggle should not depend on it'
  );
}

var testProperties = [
  clean({
    _id: 'enabledToggleId',
    type: 'toggle',
    enabled: true,
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'disabledToggleId',
    type: 'toggle',
    disabled: true,
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'conditionToggleId',
    type: 'toggle',
    ancestors: [{id: 'charId'}],
  }),
  // Children
  clean({
    _id: 'enabledToggleChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'enabledToggleId'}],
  }),
  clean({
    _id: 'disabledToggleChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'disabledToggleId'}],
  }),
  clean({
    _id: 'conditionToggleChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'conditionToggleId'}],
  }),
  clean({
    _id: 'conditionToggleGrandChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'conditionToggleId'}, {id: 'conditionToggleChildId'}],
  }),
];
