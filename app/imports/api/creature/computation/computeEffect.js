import evaluateCalculation from '/imports/api/creature/computation/evaluateCalculation.js';

export default function computeEffect(effect, memo){
  if (effect.computationDetails.computed) return;
  if (_.isFinite(effect.calculation)){
    effect.result = +effect.calculation;
  } else if(effect.operation === "conditional" || effect.operation === "rollBonus"){
    effect.result = effect.calculation;
  } else if(_.contains(["advantage", "disadvantage", "fail"], effect.operation)){
    effect.result = 1;
  } else {
    effect.result = evaluateCalculation(effect.calculation, memo);
  }
  effect.computationDetails.computed = true;
}
