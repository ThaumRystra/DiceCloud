export default class EffectAggregator{
  constructor(){
    this.base = undefined;
    this.add = 0;
    this.mul = 1;
    this.min = Number.NEGATIVE_INFINITY;
    this.max = Number.POSITIVE_INFINITY;
    this.advantage = 0;
    this.disadvantage = 0;
    this.passiveAdd = undefined;
    this.fail = 0;
    this.set = undefined;
    this.conditional = [];
    this.rollBonus = [];
    this.hasNoEffects = true;
  }
  addEffect(effect){
    let result = effect.result;
    if (this.hasNoEffects) this.hasNoEffects = false;
    switch(effect.operation){
      case 'base':
        // Take the largest base value
        if (Number.isFinite(result)){
          if(Number.isFinite(this.base)){
            this.base = Math.max(this.base, result);
          } else {
            this.base = result;
          }
        }
        break;
      case 'add':
        // Add all adds together
        this.add += result;
        break;
      case 'mul':
        // Multiply the muls together
        this.mul *= result;
        break;
      case 'min':
        // Take the largest min value
        this.min = result > this.min ? result : this.min;
        break;
      case 'max':
        // Take the smallest max value
        this.max = result < this.max ? result : this.max;
        break;
      case 'set':
        // Take the highest set value
        this.set = this.set === undefined || result > this.set ? result : this.set;
        break;
      case 'advantage':
        // Sum number of advantages
        this.advantage++;
        break;
      case 'disadvantage':
        // Sum number of disadvantages
        this.disadvantage++;
        break;
      case 'passiveAdd':
        // Add all passive adds together
        if (this.passiveAdd === undefined) this.passiveAdd = 0;
        this.passiveAdd += result;
        break;
      case 'fail':
        // Sum number of fails
        this.fail++;
        break;
      case 'conditional':
        // Store array of conditionals
        this.conditional.push(result);
        break;
      case 'rollBonus':
        // Store array of roll bonuses
        this.rollBonus.push(result);
        break;
    }
  }
}
