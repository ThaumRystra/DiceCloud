import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import RA_DICE from '/imports/constants/RA_DICE';

const inputProviderForTests: InputProvider = {
  async targetIds(target, currentTargetIds = []) {
    return currentTargetIds;
  },
  /**
   * For testing, randomness is hard to deal with
   * rollDice function returns the average roll for every dice rolled, but increasing by one each time
   * [6d10, 1d4] => [[6,7,8,9,10,1], [3]]
   */
  async rollDice(dice = []) {
    const result: number[][] = [];
    for (const diceRoll of dice) {
      const averageRoll = Math.round(diceRoll.diceSize / 2);
      // Return an array full of averagely rolled dice, increasing by 1 for every dice
      result.push(
        new Array(diceRoll.number)
          .fill(averageRoll)
          .map((value, index) => (value + index - 1) % diceRoll.diceSize + 1)
      )
    }
    return result;
  },
  /**
   * For testing, always return the minimum number of choices, always choosing the first options
   */
  async choose(choices, quantity = [1, 1]) {
    const chosen: string[] = [];
    const choiceQuantity = quantity[0] <= 0 ? 1 : quantity[0];
    for (let i = 0; i < choiceQuantity && i < choices.length; i += 1) {
      chosen.push(choices[i]._id);
    }
    return chosen;
  },
  /**
   * For testing, always return the suggested advantage, as if the user never chose differently
   */
  async advantage(suggestedAdvantage) {
    return suggestedAdvantage;
  },
  async check(suggestedParams) {
    return suggestedParams;
  },
}

export const critInputProvider: InputProvider = {
  ...inputProviderForTests,
  async rollDice(dice = []) {
    // when rolling the 2d10 core roll (with or without advantage), crit by rolling two 10s,
    // otherwise use the normal test roll provider.
    // Note: this also matches any other lone roll of 2+ d10s, such as 2d10 damage,
    // because they can't be told apart from the core roll here
    if (
      dice.length === 1
      && dice[0].diceSize === RA_DICE.diceSize
      && dice[0].number >= RA_DICE.keep
    ) {
      const [roll] = await inputProviderForTests.rollDice(dice);
      roll[0] = RA_DICE.diceSize;
      roll[1] = RA_DICE.diceSize;
      return [roll];
    }
    return inputProviderForTests.rollDice(dice);
  },
};

export default inputProviderForTests;
