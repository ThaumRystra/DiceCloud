import combineStat from '/imports/api/creature/computation/combineStat.js';
import computeEffect from '/imports/api/creature/computation/computeEffect.js';
import EffectAggregator from '/imports/api/creature/computation/EffectAggregator.js';
import applyToggles from '/imports/api/creature/computation/applyToggles.js';
import { each } from 'lodash';

export default function computeStat(stat, memo){
  // If the stat is already computed, skip it
  if (stat.computationDetails.computed) return;
  if (stat.computationDetails.busyComputing){
    // Trying to compute this stat again while it is already computing.
    // We must be in a dependency loop.
    stat.computationDetails.computed = true;
    stat.value = NaN;
    stat.computationDetails.busyComputing = false;
    stat.computationDetails.error = 'dependencyLoop';
    if (Meteor.isClient) console.warn('dependencyLoop', stat);
    return;
  }
  // Before doing any work, mark this stat as busy
  stat.computationDetails.busyComputing = true;
  // Apply any toggles
  applyToggles(stat, memo);

  if (!stat.computationDetails.disabledByToggle){
    // Compute and aggregate all the effects
    let aggregator = new EffectAggregator(stat, memo)
    each(stat.computationDetails.effects, (effect) => {
      computeEffect(effect, memo);
      if (!effect.computationDetails.disabledByToggle){
        aggregator.addEffect(effect);
      }
    });
    // Conglomerate all the effects to compute the final stat values
    combineStat(stat, aggregator, memo);
  }
  // Mark the attribute as computed
  stat.computationDetails.computed = true;
  stat.computationDetails.busyComputing = false;
}
