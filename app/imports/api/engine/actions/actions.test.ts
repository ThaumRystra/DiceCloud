import { assert } from 'chai';
import '/imports/api/simpleSchemaConfig.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { propsFromForest } from '/imports/api/properties/tests/propTestBuilder.testFn';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import Actions, { Action, Update, LogContent, applyAction } from '/imports/api/engine/actions/Actions';
import computeCreature from '/imports/api/engine/computeCreature';
import { loadCreature } from '/imports/api/engine/loadCreatures';

let creatureId;

describe('Interrupt action system', function () {
  let unload: (() => void) | undefined = undefined;
  const dummySubscription = {
    onStop(fn) {
      unload = fn;
    }
  };
  before(async function () {
    await Promise.all([
      CreatureProperties.removeAsync({}),
      Creatures.removeAsync({}),
      CreatureVariables.removeAsync({}),
    ]);
    creatureId = await Creatures.insertAsync({
      name: 'action test creature',
      owner: Random.id(),
      dirty: true,
    });
    await insertActionTestProps();
    loadCreature(creatureId, dummySubscription);
    computeCreature(creatureId);
  });
  after(function () {
    unload?.();
  });
  it('writes notes to the log', async function () {
    const action = await runActionById(note1Id);
    assert.deepEqual(
      allLogContent(action),
      [{ value: 'Note 1 summary. 1 + 1 = 2' }]
    );
  });
  it('Applies children of folders', async function () {
    const action = await runActionById(folderId);
    assert.deepEqual(
      allLogContent(action),
      [{ value: 'child of folder' }]
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
    throw 'not implemented yet';
    const action = await runActionById(choiceBranchId);
  });
  it('Applies adjustments', async function () {
    let action = await runActionById(adjustmentSetId);
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
  it('Applies rolls', async function () {
    const action = await runActionById(rollId);
    assert.deepEqual(allLogContent(action), [
      {
        name: 'New Roll',
        value: '7d1 [1, 1, 1, 1, 1, 1, 1] + 9\n**16**',
        inline: true,
        silenced: undefined,
      }, {
        value: 'rollVar: 16'
      }
    ]);
  });
});

function createAction(prop, targetIds?) {
  const action: Action = {
    creatureId: prop.ancestors[0].id,
    rootPropId: prop._id,
    results: [],
    taskCount: 0,
    targetIds,
  };
  return Actions.insertAsync(action);
}

async function runActionById(propId) {
  const prop = await CreatureProperties.findOneAsync(propId);
  const actionId = await createAction(prop);
  const action = await Actions.findOneAsync(actionId);
  if (!action) throw 'Action is expected to exist';
  await applyAction(action);
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

let note1Id, folderId, ifTruthyBranchId, ifFalsyBranchId, indexBranchId, choiceBranchId, adjustedStatId,
  adjustmentIncrementId, adjustmentSetId, rollId;

const propForest = [
  // Apply a simple note
  {
    _id: note1Id = Random.id(),
    type: 'note',
    summary: {
      text: 'Note 1 summary. 1 + 1 = {1 + 1}'
    },
  },
  // Apply a folder with a note inside
  {
    _id: folderId = Random.id(),
    type: 'folder',
    children: [{ type: 'note', summary: { text: 'child of folder' } }],
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
  // Apply rolls
  {
    _id: rollId = Random.id(),
    type: 'roll',
    // Roll d1's because it's a pain to test random numbers
    roll: { calculation: '1 + 3 + 7d1 + 5' },
    variableName: 'rollVar',
    children: [
      { type: 'note', summary: { text: 'rollVar: {rollVar}' } }
    ]
  }
];

function insertActionTestProps() {
  const promises = propsFromForest(propForest, [{ id: creatureId, collection: 'creatures' }]).map(prop => {
    return CreatureProperties.insertAsync(prop);
  });
  return Promise.all(promises);
}
