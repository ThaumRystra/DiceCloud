import evaluateCalculation from '/imports/api/creature/computation/evaluateCalculation.js';

export default function computeToggle(toggle, memo){
  if (toggle.computationDetails.computed) return;
  if (toggle.computationDetails.busyComputing){
    // Trying to compute this effect again while it is already computing.
    // We must be in a dependency loop.
    toggle.computationDetails.computed = true;
    toggle.result = false;
    toggle.computationDetails.busyComputing = false;
    toggle.computationDetails.error = 'dependencyLoop';
    if (Meteor.isClient) console.warn('dependencyLoop', toggle);
    return;
  }
  // Before doing any work, mark this toggle as busy
  toggle.computationDetails.busyComputing = true;

  // Do work
  delete toggle.errors;
  if (toggle.enabled){
    toggle.toggleResult = true;
  } else if (toggle.disabled){
    toggle.toggleResult = false;
  } else if (!toggle.condition){
    toggle.toggleResult = false;
  } else if (Number.isFinite(+toggle.condition)){
    toggle.toggleResult = !!+toggle.condition;
  } else {
    let {value, errors} = evaluateCalculation(toggle.condition, memo);
    toggle.toggleResult = value;
    if (errors.length){
      toggle.errors = errors;
    }
  }
  toggle.computationDetails.computed = true;
  toggle.computationDetails.busyComputing = false;
}
