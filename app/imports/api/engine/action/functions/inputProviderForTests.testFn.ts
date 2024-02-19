import InputProvider from '/imports/api/engine/action/functions/InputProvider';

const inputProviderForTests: InputProvider = {
  /**
   * For testing, randomness is hard to deal with
   * rollDice function returns the average roll for every dice rolled
   * [5d10, 1d4] => [[6,6,6,6,6], [3]]
   */
  async rollDice(action, dice) {
    const result: number[][] = [];
    for (const diceRoll of dice) {
      const averageRoll = Math.round(diceRoll.diceSize / 2);
      // Return an array full of averagely rolled dice
      result.push(
        new Array(diceRoll.number)
          .fill(averageRoll)
      )
    }
    return result;
  },
  /**
   * For testing, always return the minimum number of choices, always choosing the first options
   */
  async choose(action, choices, quantity = [1, 1]) {
    const chosen: string[] = [];
    const choiceQuantity = quantity[0] <= 0 ? 1 : quantity[0];
    for (let i = 0; i < choiceQuantity && i < choices.length; i += 1) {
      chosen.push(choices[i]._id);
    }
    return chosen;
  }
}

export default inputProviderForTests;
