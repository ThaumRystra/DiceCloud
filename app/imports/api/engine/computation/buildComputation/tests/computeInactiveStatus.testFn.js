import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import clean from '../../utility/cleanProp.testFn';
import { applyNestedSetProperties } from '/imports/api/parenting/parentingFunctions';

export default function () {
  let computation = buildComputationFromProps(testProperties);

  const bySelf = (propId, note) => assertDeactivatedBySelf(computation, propId, note);
  const byAncestor = (propId, note) => assertDeactivatedByAncestor(computation, propId, note);
  const active = (propId, note) => assertActive(computation, propId, note);

  // Items
  active('itemUnequippedId', 'Unequipped items should be active');
  byAncestor('itemUnEQChildId', 'Children of unequipped items should be inactive');
  active('itemEquippedId', 'Equipped items should be active');
  active('itemEquippedChildId', 'Children of equipped items should be active');

  // Spells
  active('spellPreparedId', 'Prepared spells should be active');
  byAncestor('spellPreparedChildId', 'Children of prepared spells should be deactivatedByAncestor');
  active('spellAlwaysPreparedId', 'Always prepared spells should be active');
  byAncestor('spellAlwaysPreparedChildId', 'Children of always prepared spells should be deactivatedByAncestor');
  bySelf('spellUnpreparedId', 'Unprepared spells should be deactivatedBySelf');
  byAncestor('spellUnpreparedChildId', 'Children of unprepared spells should be deactivatedByAncestor');

  // Notes
  active('NoteId', 'Notes should be active');
  active('NoteChildId', 'children of notes should be active');
}

function assertDeactivatedBySelf(computation, propId, note) {
  const prop = computation.propsById[propId];
  assert.isTrue(prop.deactivatedBySelf, note);
  assert.isTrue(prop.inactive, note + '. The property should be inactive');
}

function assertDeactivatedByAncestor(computation, propId, note) {
  const prop = computation.propsById[propId];
  assert.isTrue(prop.deactivatedByAncestor, note);
  assert.isTrue(prop.inactive, 'The property should be inactive');
}

function assertActive(computation, propId, note) {
  const prop = computation.propsById[propId];
  assert.isNotTrue(prop.inactive, note);
  assert.isNotTrue(prop.deactivatedBySelf, note);
  assert.isNotTrue(prop.deactivatedBySelf, note);
}

var testProperties = [
  // Items
  clean({
    _id: 'itemUnequippedId',
    type: 'item',
    parentId: 'charId',
  }),
  clean({
    _id: 'itemUnEQChildId',
    type: 'folder',
    parentId: 'itemUnequippedId',
  }),
  clean({
    _id: 'itemEquippedId',
    type: 'item',
    equipped: true,
    parentId: 'charId',
  }),
  clean({
    _id: 'itemEquippedChildId',
    type: 'folder',
    parentId: 'itemEquippedId',
  }),
  // Spells
  clean({
    _id: 'spellPreparedId',
    type: 'spell',
    parentId: 'charId',
    prepared: true,
  }),
  clean({
    _id: 'spellPreparedChildId',
    type: 'folder',
    parentId: 'spellPreparedId',
  }),
  clean({
    _id: 'spellAlwaysPreparedId',
    type: 'spell',
    parentId: 'charId',
    alwaysPrepared: true,
  }),
  clean({
    _id: 'spellAlwaysPreparedChildId',
    type: 'folder',
    parentId: 'spellAlwaysPreparedId',
  }),
  clean({
    _id: 'spellUnpreparedId',
    type: 'spell',
    parentId: 'charId',
  }),
  clean({
    _id: 'spellUnpreparedChildId',
    type: 'folder',
    parentId: 'spellUnpreparedId',
  }),
  // Notes
  clean({
    _id: 'NoteId',
    type: 'note',
    parentId: 'charId',
  }),
  clean({
    _id: 'NoteChildId',
    type: 'folder',
    parentId: 'NoteId',
  }),
];

applyNestedSetProperties(testProperties);
