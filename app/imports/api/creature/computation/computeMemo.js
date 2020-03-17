import { each, forOwn } from 'lodash';
import computeStat from '/imports/api/creature/computation/computeStat.js';
import computeEffect from '/imports/api/creature/computation/computeEffect.js';

export default function computeMemo(memo){
  forOwn(memo.statsByVariableName, (stat) => {
    computeStat (stat, memo);
  });
  each(memo.unassignedEffects, (effect) => {
    computeEffect(effect, memo);
  });
}
