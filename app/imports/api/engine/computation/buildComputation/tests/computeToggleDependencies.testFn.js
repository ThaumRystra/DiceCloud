import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import clean from '../../utility/cleanProp.testFn';
import { applyNestedSetProperties } from '/imports/api/parenting/parentingFunctions';

export default function () {
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
  }),
  clean({
    _id: 'disabledToggleId',
    type: 'toggle',
    disabled: true,
  }),
  clean({
    _id: 'conditionToggleId',
    type: 'toggle',
  }),
  // Children
  clean({
    _id: 'enabledToggleChildId',
    type: 'folder',
    parentId: 'enabledToggleId',
  }),
  clean({
    _id: 'disabledToggleChildId',
    type: 'folder',
    parentId: 'disabledToggleId',
  }),
  clean({
    _id: 'conditionToggleChildId',
    type: 'folder',
    parentId: 'conditionToggleId',
  }),
  clean({
    _id: 'conditionToggleGrandChildId',
    type: 'folder',
    parentId: 'conditionToggleChildId',
  }),
];

applyNestedSetProperties(testProperties);
