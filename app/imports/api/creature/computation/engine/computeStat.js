import combineStat from '/imports/api/creature/computation/engine/combineStat.js';
import computeEffect from '/imports/api/creature/computation/engine/computeEffect.js';
import EffectAggregator from '/imports/api/creature/computation/engine/EffectAggregator.js';
import applyToggles from '/imports/api/creature/computation/engine/applyToggles.js';
import { each, union } from 'lodash';

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

  // Compute and aggregate all the effects
  let aggregator = new EffectAggregator(stat, memo)
  each(stat.computationDetails.effects, (effect) => {
    computeEffect(effect, memo);
    if (effect.deactivatedByToggle) return;
    if (effect._id){
      stat.dependencies = union(
        stat.dependencies,
        [effect._id]
      );
    }
    stat.dependencies = union(
      stat.dependencies,
      effect.dependencies
    )
    aggregator.addEffect(effect);
  });
  // Conglomerate all the effects to compute the final stat values
  combineStat(stat, aggregator, memo);
  // Mark the attribute as computed
  stat.computationDetails.computed = true;
  stat.computationDetails.busyComputing = false;
}
