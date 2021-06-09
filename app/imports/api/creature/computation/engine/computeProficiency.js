import applyToggles from '/imports/api/creature/computation/engine/applyToggles.js';

export default function computeEffect(proficiency, memo){
  if (proficiency.computationDetails.computed) return;
  if (proficiency.computationDetails.busyComputing){
    // Trying to compute this proficiency again while it is already computing.
    // We must be in a dependency loop.
    proficiency.computationDetails.computed = true;
    proficiency.result = NaN;
    proficiency.computationDetails.busyComputing = false;
    proficiency.computationDetails.error = 'dependencyLoop';
    if (Meteor.isClient) console.warn('dependencyLoop', proficiency);
    return;
  }
  // Before doing any work, mark this proficiency as busy
  proficiency.computationDetails.busyComputing = true;

  // Apply any toggles
  applyToggles(proficiency, memo);

  proficiency.computationDetails.computed = true;
  proficiency.computationDetails.busyComputing = false;
}
