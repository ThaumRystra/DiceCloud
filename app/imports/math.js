import { create, all } from 'mathjs';

const math = create(all);
math.import({
  'if': function(pred, a, b) {
      return pred ? a : b;
  },
  'roll': function(number, diceSize){
    let randomSrc = DDP.randomStream('diceRoller');
    if (number > 100) throw 'Can only roll 100 dice at a time';
    let rollTotal = 0;
    let i, roll;
    for (i = 0; i < number; i++){
      roll = ~~(randomSrc.fraction() * diceSize) + 1
      rollTotal += roll;
    }
    return rollTotal;
  }
});

export default math;
