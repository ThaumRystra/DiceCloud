import evaluateCalculation from '/imports/api/creature/computation/engine/evaluateCalculation.js';
import applyToggles from '/imports/api/creature/computation/engine/applyToggles.js';
import { union } from 'lodash';

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

  // Apply any parent toggles
  applyToggles(toggle, memo);

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
    let {
      result,
      context,
      dependencies,
    } = evaluateCalculation({string: toggle.condition, prop: toggle, memo});
    toggle.toggleResult = !!result.value;
    toggle.dependencies = union(
      toggle.dependencies,
      dependencies,
    );
    if (context.errors.length){
      toggle.errors = context.errors;
    }
  }
  if (!toggle.toggleResult){
    toggle.inactive = true;
    toggle.deactivatedBySelf = true;
    toggle.deactivatedByToggle = true;
  }
  toggle.computationDetails.computed = true;
  toggle.computationDetails.busyComputing = false;
}
