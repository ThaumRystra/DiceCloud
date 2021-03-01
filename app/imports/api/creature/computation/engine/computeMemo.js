import { each, forOwn } from 'lodash';
import computeLevels from '/imports/api/creature/computation/engine/computeLevels.js';
import computeStat from '/imports/api/creature/computation/engine/computeStat.js';
import computeEffect from '/imports/api/creature/computation/engine/computeEffect.js';
import computeToggle from '/imports/api/creature/computation/engine/computeToggle.js';
import computeEndStepProperty from '/imports/api/creature/computation/engine/computeEndStepProperty.js';
import computeInlineCalculations from '/imports/api/creature/computation/engine/computeInlineCalculations.js';
import computeConstant from '/imports/api/creature/computation/engine/computeConstant.js';

export default function computeMemo(memo){
  // Compute all constants that could be used
  forOwn(memo.constantsByVariableName, constant => {
    computeConstant (constant, memo);
  });
  // Compute level
  computeLevels(memo);
  // Compute all stats, even if they are overriden
  forOwn(memo.statsById, stat => {
    computeStat (stat, memo);
  });
  // Compute effects which didn't end up targeting a stat
  each(memo.unassignedEffects, effect => {
    computeEffect(effect, memo);
  });
  // Compute toggles which didn't already get computed by dependencies
  forOwn(memo.togglesById, toggle => {
    computeToggle(toggle, memo);
  });
  // Compute end step properties
  forOwn(memo.endStepPropsById, prop => {
    computeEndStepProperty(prop, memo);
  });
  // Compute inline calculations
  forOwn(memo.propsById, prop => {
    computeInlineCalculations(prop, memo);
  });
}
