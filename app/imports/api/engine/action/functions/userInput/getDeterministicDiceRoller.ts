import Alea from 'alea';

/**
 * Return a function that can be be used as InputProvider.rollDice
 * this function instance must be used for the entire action
 */
export default function getDeterministicDiceRoller(
  actionId: string
): (dice: { number: number, diceSize: number }[]) => Promise<number[][]> {
  // Create a random number generator seeded on the ID of the action
  if (!actionId) throw new Meteor.Error('Id Required', 'action ID can not be ' + actionId)
  const randFrac = Alea(actionId);
  return (dice) => {
    const results: number[][] = [];
    for (const diceRoll of dice) {
      const values: number[] = [];
      if (diceRoll.number > 100) {
        throw new Meteor.Error('Too many dice', 'can only roll up to 100 dice at once');
      }
      for (let i = 0; i < diceRoll.number; i++) {
        const rolledValue = ~~(randFrac() * diceRoll.diceSize) + 1
        values.push(rolledValue);
      }
      results.push(values);
    }
    return Promise.resolve(results);
  }
}
