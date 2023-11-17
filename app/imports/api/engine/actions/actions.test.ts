import { assert } from 'chai';
import '/imports/api/simpleSchemaConfig.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { propsFromForest } from '/imports/api/properties/tests/propTestBuilder.testFn';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import Actions, { Action, Update, LogContent, createAction, runAction } from '/imports/api/engine/actions/Actions';
import computeCreature from '/imports/api/engine/computeCreature';

let creatureId;

describe('Interrupt action system', function () {
  before(async function () {
    CreatureProperties.remove({});
    Creatures.remove({});
    CreatureVariables.remove({});
    creatureId = await Creatures.insertAsync({
      name: 'action test creature',
      owner: Random.id(),
      dirty: true,
    });
    await insertActionTestProps();
    computeCreature(creatureId);
  });
  it('writes notes to the log', async function () {
    const action = await runActionById(note1Id);
    assert.deepEqual(
      allLogContent(action),
      [{ value: 'Note 1 summary. 1 + 1 = 2' }]
    );
  });
  it('Applies the children of if branches', async function () {
    let action = await runActionById(ifTruthyBranchId);
    assert.deepEqual(
      allLogContent(action),
      [{ value: 'child of if branch' }]
    );
    action = await runActionById(ifFalsyBranchId);
    assert.deepEqual(
      allLogContent(action),
      []
    );
  });
  it('Applies the children of index branches', async function () {
    const action = await runActionById(indexBranchId);
    assert.deepEqual(
      allLogContent(action),
      [{ value: 'child 2 of index branch' }]
    );
  });
  it('Halts execution of choice branches', async function () {
    const action = await runActionById(choiceBranchId);
    assert.exists(action.userInputNeeded);
    assert.deepEqual(
      allLogContent(action),
      []
    );
  });
  it('Applies adjustments', async function () {
    let action = await runActionById(adjustmentSetId)
    assert.deepEqual(
      allUpdates(action),
      [{
        propId: adjustedStatId,
        type: 'attribute',
        set: { damage: 5, value: 3 },
      }],
      'Applying set adjustments should return the correct updates'
    );
    action = await runActionById(adjustmentIncrementId)
    assert.deepEqual(
      allUpdates(action),
      [{
        propId: adjustedStatId,
        type: 'attribute',
        inc: { damage: 2, value: -2 }, // damage goes up by 2, value down by 2
      }],
      'Applying increment adjustments should return the correct updates'
    );
  });
});

async function runActionById(propId) {
  const prop = await CreatureProperties.findOneAsync(propId);
  const actionId = await createAction(prop);
  await runAction(actionId);
  const action = await Actions.findOneAsync(actionId);
  if (!action) throw 'Action is expected to exist'
  return action;
}

function allUpdates(action: Action) {
  const updates: Update[] = [];
  action.results.forEach(result => {
    result.mutations.forEach(mutation => {
      mutation.updates?.forEach(update => {
        updates.push(update);
      });
    });
  });
  return updates;
}

function allLogContent(action: Action) {
  const contents: LogContent[] = [];
  action.results.forEach(result => {
    result.mutations.forEach(mutation => {
      mutation.contents?.forEach(logContent => {
        contents.push(logContent);
      });
    });
  });
  return contents;
}

let note1Id, ifTruthyBranchId, ifFalsyBranchId, indexBranchId, choiceBranchId, adjustedStatId, adjustmentIncrementId, adjustmentSetId;

const propForest = [
  // Apply a simple note
  {
    _id: note1Id = Random.id(),
    type: 'note',
    summary: {
      text: 'Note 1 summary. 1 + 1 = {1 + 1}'
    },
  },
  // Apply an if branch with a truthy condition
  {
    _id: ifTruthyBranchId = Random.id(),
    type: 'branch',
    branchType: 'if',
    condition: { calculation: '1 + 1' },
    children: [{ type: 'note', summary: { text: 'child of if branch' } }],
  },
  // Apply an if branch with a falsy condition
  {
    _id: ifFalsyBranchId = Random.id(),
    type: 'branch',
    branchType: 'if',
    condition: { calculation: '1 - 1' },
    children: [{ type: 'note', summary: { text: 'child of if branch' } }],
  },
  // Apply an index branch
  {
    _id: indexBranchId = Random.id(),
    type: 'branch',
    branchType: 'index',
    condition: { calculation: '1 + 1' },
    children: [
      { type: 'note', summary: { text: 'child 1 of index branch' } },
      { type: 'note', summary: { text: 'child 2 of index branch' } },
      { type: 'note', summary: { text: 'child 3 of index branch' } },
    ],
  },
  // Apply a choice branch
  {
    _id: choiceBranchId = Random.id(),
    type: 'branch',
    branchType: 'choice',
    children: [
      { type: 'note', summary: { text: 'child 1 of choice branch' } },
      { type: 'note', summary: { text: 'child 2 of choice branch' } },
      { type: 'note', summary: { text: 'child 3 of choice branch' } },
    ],
  },
  // Apply adjustments
  {
    _id: adjustedStatId = Random.id(),
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'adjustedStat',
    baseValue: { calculation: '8' },
  }, {
    _id: adjustmentSetId = Random.id(),
    type: 'adjustment',
    stat: 'adjustedStat',
    operation: 'set',
    amount: { calculation: '3' },
    target: 'self',
    children: [
      { type: 'note', summary: { text: 'adjustment set applied' } },
    ],
  }, {
    _id: adjustmentIncrementId = Random.id(),
    type: 'adjustment',
    stat: 'adjustedStat',
    operation: 'increment',
    amount: { calculation: '2' },
    target: 'self',
    children: [
      { type: 'note', summary: { text: 'adjustment increment applied' } },
    ],
  },
];

function insertActionTestProps() {
  const promises = propsFromForest(propForest, [{ id: creatureId, collection: 'creatures' }]).map(prop => {
    return CreatureProperties.insertAsync(prop);
  });
  return Promise.all(promises);
}
