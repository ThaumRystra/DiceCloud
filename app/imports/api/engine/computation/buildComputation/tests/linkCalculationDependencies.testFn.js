import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import clean from '../../utility/cleanProp.testFn';
import { applyNestedSetProperties } from '/imports/api/parenting/parentingFunctions';

export default function () {
  const computation = buildComputationFromProps(testProperties);
  const hasLink = computation.dependencyGraph.hasLink;
  const prop = (id) => computation.propsById[id];
  assert.isTrue(
    !!hasLink('childId.description.inlineCalculations[0]', 'spellListId'),
    'Ancestor references of parent in inline calculations should create dependency'
  );
  assert.isTrue(
    !!hasLink('grandchildId.dc', 'spellListId'),
    'References to higher ancestor should create dependency'
  );
  assert.isTrue(
    !!hasLink('grandchildId.dc', 'strength'),
    'Variable references create dependencies'
  );
  assert.isTrue(
    !!hasLink('grandchildId.dc', 'wisdom'),
    'Variable references create dependencies even if the attributes don\'t exist'
  );
  assert.equal(
    prop('strengthId').baseValue.parseError.message, 'Unexpected end of input',
    'Parse errors should be stored on the calculation doc'
  );
}

var testProperties = [
  clean({
    _id: 'spellListId',
    type: 'spellList',
  }),
  clean({
    _id: 'childId',
    type: 'spell',
    description: {
      text: 'DC {#spellList.dc} save or suck'
    },
    parentId: 'spellListId',
  }),
  clean({
    _id: 'grandchildId',
    type: 'savingThrow',
    dc: {
      calculation: '#spellList.dc + strength + wisdom.modifier'
    },
    parentId: 'childId',
  }),
  clean({
    _id: 'strengthId',
    type: 'attribute',
    variableName: 'strength',
    baseValue: {
      calculation: '15 + ',
    },
  }),
];

applyNestedSetProperties(testProperties);
