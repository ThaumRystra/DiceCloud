import { assert } from 'chai';
import '/imports/api/simpleSchemaConfig.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { propsFromForest } from '/imports/api/properties/tests/propTestBuilder.testFn';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import Actions, { createAction, runAction } from '/imports/api/engine/actions/Actions';
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
    assert.equal(
      await testRunActionById(note1Id),
      'Note 1 summary. 1 + 1 = 2'
    );
  });
  it('Applies the children of if branches', async function () {
    assert.equal(
      await testRunActionById(ifTruthyBranchId),
      'child of if branch'
    );
    assert.isUndefined(
      await testRunActionById(ifFalsyBranchId)
    );
  });
  it('Applies the children of index branches', async function () {
    assert.equal(
      await testRunActionById(indexBranchId),
      'child 2 of index branch'
    );
  });
  it('Halts execution of choice branches', async function () {
    const action = await runActionById(choiceBranchId);
    if (!action) throw 'Action is expected to exist';
    assert.isUndefined(action.results[0]);
    assert.exists(action.userInputNeeded);
  });
});

async function runActionById(propId) {
  const prop = await CreatureProperties.findOneAsync(propId);
  const actionId = await createAction(prop);
  await runAction(actionId);
  const action = await Actions.findOneAsync(actionId);
  return action;
}

async function testRunActionById(propId) {
  const action = await runActionById(propId);
  return action?.results?.[action.results.length - 1]?.mutations?.[0]?.contents?.[0]?.value;
}

let note1Id, ifTruthyBranchId, ifFalsyBranchId, indexBranchId, choiceBranchId;

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
];

function insertActionTestProps() {
  const promises = propsFromForest(propForest, [{ id: creatureId, collection: 'creatures' }]).map(prop => {
    return CreatureProperties.insertAsync(prop);
  });
  return Promise.all(promises);
}
