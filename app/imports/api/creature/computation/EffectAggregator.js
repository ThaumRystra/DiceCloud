import evaluateCalculation from '/imports/api/creature/computation/evaluateCalculation.js';

export default class EffectAggregator{
  constructor(stat, memo){
    delete this.baseValueErrors;
    if (stat.baseValueCalculation){
      let {value, errors} = evaluateCalculation(stat.baseValueCalculation, memo);
      this.statBaseValue = value;
      if (errors.length){
        this.baseValueErrors = errors;
      }
      this.base = this.statBaseValue;
    } else {
      this.base = 0;
    }
    this.add = 0;
    this.mul = 1;
    this.min = Number.NEGATIVE_INFINITY;
    this.max = Number.POSITIVE_INFINITY;
    this.advantage = 0;
    this.disadvantage = 0;
    this.passiveAdd = 0;
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
        this.base = result > this.base ? result : this.base;
        if (effect.statBase){
          if (this.statBaseValue === undefined || result > this.statBaseValue){
            this.statBaseValue = result;
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
