import applyToggles from '/imports/api/creature/computation/engine/applyToggles.js';

export default function computeConstant(constant, memo){
  // Apply any toggles
  applyToggles(constant, memo);
}
