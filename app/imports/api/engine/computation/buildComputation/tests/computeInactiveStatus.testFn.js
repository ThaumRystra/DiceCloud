import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  let computation = buildComputationFromProps(testProperties);
  const bySelf = (propId, note) => assertDeactivatedBySelf(computation, propId, note);
  const byAncestor = (propId, note) => assertDeactivatedByAncestor(computation, propId, note);
  const active = (propId, note) => assertActive(computation, propId, note);

  // Buffs
  bySelf('buffNotAppliedId');
  byAncestor('buffNotAppliedChildId');
  active('buffAppliedId');
  active('buffAppliedChildId');

  // Items
  active('itemUnequippedId', 'Unequipped items should be active');
  byAncestor('itemUnequippedChildId', 'Children of unequipped items should be inactive');
  active('itemEquippedId');
  active('itemEquippedChildId');

  // Spells
  active('spellPreparedId');
  active('spellPreparedChildId');
  active('spellAlwaysPreparedId');
  active('spellAlwaysPreparedChildId');
  bySelf('spellUnpreparedId');
  byAncestor('spellUnpreparedChildId');

  // Notes
  active('NoteId', 'Notes should be active');
  byAncestor('NoteChildId', 'children of notes should always be inactive');
}

function assertDeactivatedBySelf(computation, propId, note){
  const prop = computation.propsById[propId];
  assert.isTrue(prop.deactivatedBySelf, note);
  assert.isTrue(prop.inactive, 'The property should be inactive');
}

function assertDeactivatedByAncestor(computation, propId, note){
  const prop = computation.propsById[propId];
  assert.isTrue(prop.deactivatedByAncestor, note);
  assert.isTrue(prop.inactive, 'The property should be inactive');
}

function assertActive(computation, propId, note){
  const prop = computation.propsById[propId];
  assert.isNotTrue(prop.inactive, note);
  assert.isNotTrue(prop.deactivatedBySelf);
  assert.isNotTrue(prop.deactivatedBySelf);
}

var testProperties = [
  // Buffs
  clean({
    _id: 'buffNotAppliedId',
    type: 'buff',
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'buffNotAppliedChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'buffNotAppliedId'}],
  }),
  clean({
    _id: 'buffAppliedId',
    type: 'buff',
    applied: true,
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'buffAppliedChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'buffAppliedId'}],
  }),
  // Items
  clean({
    _id: 'itemUnequippedId',
    type: 'item',
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'itemUnequippedChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'itemUnequippedId'}],
  }),
  clean({
    _id: 'itemEquippedId',
    type: 'item',
    equipped: true,
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'itemEquippedChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'itemEquippedId'}],
  }),
  // Spells
  clean({
    _id: 'spellPreparedId',
    type: 'spell',
    ancestors: [{id: 'charId'}],
    prepared: true,
  }),
  clean({
    _id: 'spellPreparedChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'spellPreparedId'}],
  }),
  clean({
    _id: 'spellAlwaysPreparedId',
    type: 'spell',
    ancestors: [{id: 'charId'}],
    alwaysPrepared: true,
  }),
  clean({
    _id: 'spellAlwaysPreparedChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'spellAlwaysPreparedId'}],
  }),
  clean({
    _id: 'spellUnpreparedId',
    type: 'spell',
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'spellUnpreparedChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'spellUnpreparedId'}],
  }),
  // Notes
  clean({
    _id: 'NoteId',
    type: 'note',
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'NoteChildId',
    type: 'folder',
    ancestors: [{id: 'charId'}, {id: 'NoteId'}],
  }),
];
