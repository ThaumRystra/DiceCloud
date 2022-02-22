export default function rollDice(number, diceSize){
  let values = [];
  let randomSrc = DDP.randomStream('diceRoller');
  for (let i = 0; i < number; i++){
    let roll = ~~(randomSrc.fraction() * diceSize) + 1
    values.push(roll);
  }
  return values;
}
