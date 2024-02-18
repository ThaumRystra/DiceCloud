export default function rollDice(number: number, diceSize: number): number[] {
  const values: number[] = [];
  const randomSrc = DDP.randomStream('diceRoller');
  if (number > 100) {
    throw new Meteor.Error('Too many dice', 'can only roll up to 100 dice at once');
  }
  for (let i = 0; i < number; i++) {
    const roll = ~~(randomSrc.fraction() * diceSize) + 1
    values.push(roll);
  }
  return values;
}
