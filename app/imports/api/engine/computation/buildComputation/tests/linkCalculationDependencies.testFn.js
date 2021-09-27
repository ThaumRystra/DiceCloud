import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  const hasLink = computation.dependencyGraph.hasLink;
  assert.isTrue(
    !!hasLink('childId', 'spellListId'),
    'Ancestor references of parent in inline calculations should create dependency'
  );
  assert.isTrue(
    !!hasLink('grandchildId', 'spellListId'),
    'References to higher ancestor should create dependency'
  );
  assert.isTrue(
    !!hasLink('grandchildId', 'strength'),
    'Variable references create dependencies'
  );
  assert.isTrue(
    !!hasLink('grandchildId', 'wisdom'),
    'Variable references create dependencies even if the attributes don\'t exist'
  );
}

var testProperties = [
  clean({
    _id: 'spellListId',
    type: 'spellList',
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'childId',
    type: 'spell',
    description: {
      text: 'DC {#spellList.dc} save or suck'
    },
    ancestors: [{id: 'charId'}, {id: 'spellListId'}],
  }),
  clean({
    _id: 'grandchildId',
    type: 'savingThrow',
    dc: {
      calculation: '#spellList.dc + strength + wisdom.modifier'
    },
    ancestors: [{id: 'charId'}, {id: 'spellListId'}, {id: 'childId'}],
  }),
  clean({
    _id: 'strengthId',
    type: 'attribute',
    variableName: 'strength',
    ancestors: [{id: 'charId'}],
  }),
];
