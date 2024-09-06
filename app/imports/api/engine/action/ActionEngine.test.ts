import { assert } from 'chai';
import '/imports/api/simpleSchemaConfig.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { propsFromForest } from '/imports/api/properties/tests/propTestBuilder.testFn';
import Creatures from '/imports/api/creature/creatures/Creatures';
import computeCreature from '/imports/api/engine/computeCreature';
import { loadCreature } from '/imports/api/engine/loadCreatures';
import EngineActions, { EngineAction } from '/imports/api/engine/action/EngineActions';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import { LogContent, Removal, Update } from '/imports/api/engine/action/tasks/TaskResult';
import inputProvider from './functions/userInput/inputProviderForTests.testFn';
import { removeAllCreaturesAndProps } from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const creatureId = Random.id();
const targetId = Random.id();

describe('Interrupt action system', function () {
  const dummySubscription = Tracker.autorun(() => undefined)
  this.timeout(8000);
  before(async function () {
    // Remove old data
    await removeAllCreaturesAndProps();

    // Add creatures
    await Promise.all([
      Creatures.insertAsync({
        _id: creatureId,
        name: 'action test creature',
        owner: Random.id(),
        dirty: true,
        type: 'pc',
        readers: [],
        writers: [],
        public: false,
        settings: {},
      }),
      Creatures.insertAsync({
        _id: targetId,
        name: 'action test creature',
        owner: Random.id(),
        dirty: true,
        type: 'pc',
        readers: [],
        writers: [],
        public: false,
        settings: {},
      })
    ]);
    // Add test props
    await insertActionTestProps();
    // Compute before load or we might run tests before the computation changes reflect in the cache
    computeCreature(creatureId);
    computeCreature(targetId);
    loadCreature(creatureId, dummySubscription);
  });
  after(function () {
    dummySubscription.stop();
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
  it('Gets choices from choice branches', async function () {
    const action = await runActionById(choiceBranchId);
    assert.deepEqual(
      allLogContent(action),
      [{ value: 'child 1 of choice branch' }]
    );
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
  it('Applies buffs', async function () {
    const action = await runActionById(buffId);
    const inserts = allInserts(action);
    const newIds = inserts.map(p => p._id);
    assert.notEqual(buffId, newIds[0]);
    assert.deepEqual(inserts, [
      {
        _id: newIds[0],
        left: 43,
        parentId: null,
        right: 48,
        root: {
          collection: 'creatures',
          id: creatureId,
        },
        tags: [],
        target: 'self',
        type: 'buff',
      }, {
        _id: newIds[1],
        attributeType: 'stat',
        baseValue: {
          calculation: '13 + buffSourceStat + 7',
        },
        left: 44,
        parentId: newIds[0],
        right: 45,
        root: {
          collection: 'creatures',
          id: creatureId,
        },
        tags: [],
        type: 'attribute',
        variableName: 'buffStat',
      }, {
        _id: newIds[2],
        left: 46,
        parentId: newIds[0],
        removeAll: true,
        right: 47,
        root: {
          collection: 'creatures',
          id: creatureId,
        },
        tags: [],
        target: 'self',
        targetParentBuff: true,
        type: 'buffRemover',
      }
    ]);
  });
  it('Removes parent buffs', async function () {
    const action = await runActionById(removeParentBuffId);
    assert.deepEqual(allRemovals(action), [
      { propId: buffId }
    ]);
  });
  it('Removes all buffs by tag', async function () {
    const action = await runActionById(removeTaggedBuffsId);
    assert.deepEqual(allRemovals(action), [
      { propId: taggedBuffId },
      { propId: secondTaggedBuffId },
    ]);
  });
  it('Removes a single buff by tag', async function () {
    const action = await runActionById(removeOneTaggedBuffId);
    assert.deepEqual(allRemovals(action), [
      { propId: taggedBuffId },
    ]);
  });
});

function createAction(prop, targetIds?) {
  const action: EngineAction = {
    creatureId: prop.root.id,
    rootPropId: prop._id,
    results: [],
    taskCount: 0,
    targetIds,
  };
  return EngineActions.insertAsync(action);
}

async function runActionById(propId) {
  const prop = await CreatureProperties.findOneAsync(propId);
  const actionId = await createAction(prop);
  const action = await EngineActions.findOneAsync(actionId);
  if (!action) throw 'Action is expected to exist';
  await applyAction(action, inputProvider, { simulate: true });
  return action;
}

function allUpdates(action: EngineAction) {
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

function allInserts(action: EngineAction) {
  const inserts: any[] = [];
  action.results.forEach(result => {
    result.mutations.forEach(mutation => {
      mutation.inserts?.forEach(update => {
        inserts.push(update);
      });
    });
  });
  return inserts;
}

function allRemovals(action: EngineAction) {
  const removals: Removal[] = [];
  action.results.forEach(result => {
    result.mutations.forEach(mutation => {
      mutation.removals?.forEach(update => {
        removals.push(update);
      });
    });
  });
  return removals
}

function allLogContent(action: EngineAction) {
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

let note1Id, folderId, ifTruthyBranchId, ifFalsyBranchId, indexBranchId, choiceBranchId,
  adjustedStatId, adjustmentIncrementId, adjustmentSetId, rollId, buffId,
  removeParentBuffId, removeTaggedBuffsId, removeOneTaggedBuffId, taggedBuffId, secondTaggedBuffId;

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
  // Apply buffs
  {
    _id: Random.id(),
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'buffSourceStat',
    baseValue: { calculation: '13' },
  }, {
    _id: buffId = Random.id(),
    type: 'buff',
    target: 'self',
    children: [
      {
        _id: Random.id(),
        type: 'attribute',
        attributeType: 'stat',
        variableName: 'buffStat',
        baseValue: { calculation: 'buffSourceStat + ~target.buffSourceStat + 7' },
      }, {
        _id: removeParentBuffId = Random.id(),
        type: 'buffRemover',
        target: 'self',
        targetParentBuff: true,
      },
    ],
  },
  // Extra buffs with and without tags
  {
    _id: taggedBuffId = Random.id(),
    name: 'Tagged Buff',
    type: 'buff',
    tags: ['buff tag', 'other tag']
  }, {
    _id: secondTaggedBuffId = Random.id(),
    name: 'Tagged buff 2',
    type: 'buff',
    tags: ['buff tag', 'yet another tag']
  }, {
    _id: Random.id(),
    name: 'Untagged buff',
    type: 'buff',
    tags: ['other tag']
  },
  // Remove buffs by tag
  {
    _id: removeTaggedBuffsId = Random.id(),
    type: 'buffRemover',
    target: 'self',
    removeAll: true,
    targetTags: 'buff tag',
  }, {
    _id: removeOneTaggedBuffId = Random.id(),
    type: 'buffRemover',
    target: 'self',
    removeAll: false,
    targetTags: 'buff tag',
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

const targetPropForest = [
  {
    type: 'attribute',
    attributeType: 'stat',
    variableName: 'armor',
    baseValue: { calculation: '10' },
  }
];

function insertActionTestProps() {
  const promises = propsFromForest(propForest, creatureId).map(prop => {
    return CreatureProperties.insertAsync(prop);
  });
  propsFromForest(targetPropForest, targetId).forEach(prop => {
    promises.push(CreatureProperties.insertAsync(prop));
  });
  return Promise.all(promises);
}
