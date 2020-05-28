import evaluateCalculation from '/imports/api/creature/computation/evaluateCalculation.js';
import applyToggles from '/imports/api/creature/computation/applyToggles.js';

export default function computeEffect(effect, memo){
  if (effect.computationDetails.computed) return;
  if (effect.computationDetails.busyComputing){
    // Trying to compute this effect again while it is already computing.
    // We must be in a dependency loop.
    effect.computationDetails.computed = true;
    effect.result = NaN;
    effect.computationDetails.busyComputing = false;
    effect.computationDetails.error = 'dependencyLoop';
    if (Meteor.isClient) console.warn('dependencyLoop', effect);
    return;
  }
  // Before doing any work, mark this effect as busy
  effect.computationDetails.busyComputing = true;

  // Apply any toggles
  applyToggles(effect, memo);

  // Determine result of effect calculation
  delete effect.errors;
  if (!effect.calculation){
    if(effect.operation === 'add' || effect.operation === 'base'){
      effect.result = 0;
    } else {
      delete effect.result
    }
  } else if (Number.isFinite(+effect.calculation)){
    effect.result = +effect.calculation;
  } else if(effect.operation === 'conditional' || effect.operation === 'rollBonus'){
    effect.result = effect.calculation;
  } else if(_.contains(['advantage', 'disadvantage', 'fail'], effect.operation)){
    effect.result = 1;
  } else {
    let {value, errors} = evaluateCalculation(effect.calculation, memo);
    effect.result = value;
    if (errors.length){
      effect.errors = errors;
    }
  }
  effect.computationDetails.computed = true;
  effect.computationDetails.busyComputing = false;
}
