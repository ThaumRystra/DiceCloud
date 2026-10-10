import { assert } from 'chai';
import {
  allLogContent,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  TestCreature
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';
import EngineActions, { EngineAction } from '/imports/api/engine/action/EngineActions';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import inputProviderForTests from '/imports/api/engine/action/functions/userInput/inputProviderForTests.testFn';

const [creatureId] = getRandomIds(1);

const checkTestCreature: TestCreature = {
  _id: creatureId,
  props: [
    {
      type: 'attribute',
      attributeType: 'ability',
      name: 'Strength',
      variableName: 'strength',
      baseValue: { calculation: '14' },
    },
    {
      type: 'skill',
      name: 'Athletics',
      variableName: 'athletics',
      ability: 'strength',
      baseValue: { calculation: '3' },
    },
  ],
}

async function runCheck(advantage: number) {
  const actionId = await EngineActions.insertAsync({
    creatureId,
    results: [],
    taskCount: 0,
    task: {
      subtaskFn: 'check',
      targetIds: [creatureId],
      advantage,
      skillVariableName: 'athletics',
      abilityVariableName: 'strength',
      dc: null,
    },
  } as EngineAction);
  const action = await EngineActions.findOneAsync(actionId);
  if (!action) throw 'Action is expected to exist';
  await applyAction(action, inputProviderForTests, { simulate: true });
  return action;
}

function checkScope(action: EngineAction) {
  return action.results.find(result => result.pushScope?.['~checkRoll'])?.pushScope;
}

describe('Apply check tasks', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(checkTestCreature);
  });

  it('rolls 2d10 plus the skill and ability modifiers', async function () {
    // Athletics 3 + Reverent Abyss strength 14 → +4
    const action = await runCheck(0);
    assert.deepEqual(allLogContent(action), [{
      name: 'Strength (Athletics)',
      inline: true,
    }, {
      name: 'Roll',
      value: '2d10 [ 5, 6 ] + 7\n**18**',
      inline: true,
    }]);
  });

  it('pushes the check result to scope', async function () {
    const action = await runCheck(0);
    assert.deepEqual(checkScope(action), {
      '~checkDie1': { value: 5 },
      '~checkDie2': { value: 6 },
      '~checkDiceRoll': { value: 11 },
      '~checkRoll': { value: 18 },
    });
  });

  it('rolls checks with numeric advantage', async function () {
    const action = await runCheck(2);
    assert.deepEqual(allLogContent(action)[1], {
      name: 'Roll (Advantage +2)',
      value: 'Advantage +2\n2d10 [ ~~5~~, ~~6~~, 7, 8 ] + 7\n**22**',
      inline: true,
    });
    assert.deepEqual(checkScope(action), {
      '~checkDie1': { value: 7 },
      '~checkDie2': { value: 8 },
      '~checkDiceRoll': { value: 15 },
      '~checkRoll': { value: 22 },
    });
  });
});
