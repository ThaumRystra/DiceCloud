import { assert } from 'chai';
import rollCoreDice, { clampAdvantage, writeCoreDiceScope } from '/imports/api/engine/action/functions/rollCoreDice';
import inputProviderForTests from '/imports/api/engine/action/functions/userInput/inputProviderForTests.testFn';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';

type DiceRequest = { number: number, diceSize: number }[];

// Records every rollDice call, optionally returning fixed values instead of the test rolls
function recordingProvider(fixedValues?: number[]) {
  const calls: DiceRequest[] = [];
  const provider: InputProvider = {
    ...inputProviderForTests,
    async rollDice(dice) {
      calls.push(dice);
      if (fixedValues) return [[...fixedValues]];
      return inputProviderForTests.rollDice(dice);
    },
  };
  return { calls, provider };
}

describe('rollCoreDice', function () {
  it('rolls 2d10 and keeps both with no advantage', async function () {
    const { calls, provider } = recordingProvider();
    const roll = await rollCoreDice(provider, 0, 5);
    assert.deepEqual(calls, [[{ number: 2, diceSize: 10 }]]);
    assert.deepEqual(roll, {
      kept: [5, 6],
      all: [5, 6],
      dropped: [],
      keptSum: 11,
      total: 16,
      advantage: 0,
      logText: '2d10 [ 5, 6 ] + 5',
    });
  });

  it('rolls 4 dice and keeps the highest 2 with advantage +2', async function () {
    const { calls, provider } = recordingProvider();
    const roll = await rollCoreDice(provider, 2, 5);
    assert.deepEqual(calls, [[{ number: 4, diceSize: 10 }]]);
    assert.deepEqual(roll.all, [5, 6, 7, 8]);
    assert.deepEqual(roll.kept, [7, 8]);
    assert.deepEqual(roll.dropped, [5, 6]);
    assert.equal(roll.keptSum, 15);
    assert.equal(roll.total, 20);
    assert.equal(roll.advantage, 2);
    assert.equal(roll.logText, 'Advantage +2\n2d10 [ ~~5~~, ~~6~~, 7, 8 ] + 5');
  });

  it('rolls 3 dice and keeps the lowest 2 with disadvantage −1', async function () {
    const { calls, provider } = recordingProvider();
    const roll = await rollCoreDice(provider, -1, 0);
    assert.deepEqual(calls, [[{ number: 3, diceSize: 10 }]]);
    assert.deepEqual(roll.all, [5, 6, 7]);
    assert.deepEqual(roll.kept, [5, 6]);
    assert.deepEqual(roll.dropped, [7]);
    assert.equal(roll.keptSum, 11);
    assert.equal(roll.advantage, -1);
    assert.equal(roll.logText, 'Disadvantage −1\n2d10 [ 5, 6, ~~7~~ ] + 0');
  });

  it('keeps kept dice in roll order', async function () {
    const { provider } = recordingProvider([9, 2, 4]);
    const roll = await rollCoreDice(provider, 1, 0);
    assert.deepEqual(roll.kept, [9, 4]);
    assert.deepEqual(roll.all, [9, 2, 4]);
    assert.equal(roll.logText, 'Advantage +1\n2d10 [ 9, ~~2~~, 4 ] + 0');
  });

  it('drops the later die on ties', async function () {
    const advantageRoll = await rollCoreDice(recordingProvider([7, 3, 7, 7]).provider, 2, 0);
    assert.deepEqual(advantageRoll.kept, [7, 7]);
    assert.deepEqual(advantageRoll.dropped, [3, 7]);
    assert.equal(advantageRoll.logText, 'Advantage +2\n2d10 [ 7, ~~3~~, 7, ~~7~~ ] + 0');

    const disadvantageRoll = await rollCoreDice(recordingProvider([4, 4, 4]).provider, -1, 0);
    assert.deepEqual(disadvantageRoll.kept, [4, 4]);
    assert.equal(disadvantageRoll.logText, 'Disadvantage −1\n2d10 [ 4, 4, ~~4~~ ] + 0');
  });

  it('clamps advantage to ±10', async function () {
    const high = recordingProvider();
    const highRoll = await rollCoreDice(high.provider, 1000000, 0);
    assert.deepEqual(high.calls, [[{ number: 12, diceSize: 10 }]]);
    assert.equal(highRoll.advantage, 10);

    const low = recordingProvider();
    const lowRoll = await rollCoreDice(low.provider, -1000000, 0);
    assert.deepEqual(low.calls, [[{ number: 12, diceSize: 10 }]]);
    assert.equal(lowRoll.advantage, -10);
  });

  it('truncates non-integer and ignores non-numeric advantage', async function () {
    assert.equal(clampAdvantage(2.7), 2);
    assert.equal(clampAdvantage(-1.5), -1);
    assert.equal(Object.is(clampAdvantage(-0.5), -0), false, 'Should not return -0');
    assert.equal(clampAdvantage(NaN), 0);
    assert.equal(clampAdvantage(Infinity), 0);
    assert.equal(clampAdvantage(undefined), 0);
    assert.equal(clampAdvantage('3'), 3);

    const { calls, provider } = recordingProvider();
    const roll = await rollCoreDice(provider, 2.7, 0);
    assert.deepEqual(calls, [[{ number: 4, diceSize: 10 }]]);
    assert.equal(roll.advantage, 2);
  });

  it('formats negative modifiers with a unicode minus', async function () {
    const roll = await rollCoreDice(recordingProvider().provider, 0, -3);
    assert.equal(roll.logText, '2d10 [ 5, 6 ] − 3');
    assert.equal(roll.total, 8);
  });

  it('makes exactly one rollDice call', async function () {
    for (const advantage of [-10, -3, -1, 0, 1, 3, 10]) {
      const { calls, provider } = recordingProvider();
      await rollCoreDice(provider, advantage, 0);
      assert.equal(calls.length, 1, `advantage ${advantage} should roll once`);
      assert.equal(calls[0].length, 1, `advantage ${advantage} should roll one dice group`);
    }
  });

  it('writes per-die scope variables', async function () {
    const roll = await rollCoreDice(recordingProvider([9, 2, 4]).provider, 1, 3);
    const scope = {};
    writeCoreDiceScope(scope, '~attack', roll);
    assert.deepEqual(scope, {
      '~attackDie1': { value: 9 },
      '~attackDie2': { value: 4 },
      '~attackDiceRoll': { value: 13 },
    });
  });
});
