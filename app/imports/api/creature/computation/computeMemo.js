import { each, forOwn } from 'lodash';
import computeLevels from '/imports/api/creature/computation/computeLevels.js';
import computeStat from '/imports/api/creature/computation/computeStat.js';
import computeEffect from '/imports/api/creature/computation/computeEffect.js';
import computeToggle from '/imports/api/creature/computation/computeToggle.js';
import computeEndStepProperty from '/imports/api/creature/computation/computeEndStepProperty.js';

export default function computeMemo(memo){
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
}
