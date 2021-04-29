import combineStat from '/imports/api/creature/computation/engine/combineStat.js';
import computeEffect from '/imports/api/creature/computation/engine/computeEffect.js';
import EffectAggregator from '/imports/api/creature/computation/engine/EffectAggregator.js';
import evaluateCalculation from '/imports/api/creature/computation/engine/evaluateCalculation.js';
import applyToggles from '/imports/api/creature/computation/engine/applyToggles.js';
import { each, union, without } from 'lodash';

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

  let effects = stat.computationDetails.effects || [];
  let proficiencies = stat.computationDetails.proficiencies;

  // Get references to all the stats that share the variable name
  let sameNameStats

  if (stat.computationDetails.idsOfSameName){
    sameNameStats = stat.computationDetails.idsOfSameName.map(
      id => memo.propsById[id]
    );
  } else {
    sameNameStats = [];
  }

  let allStats = [stat, ...sameNameStats];

  // Decide which stat is the last active stat
  // The last active stat is considered the cannonical stat
  let lastActiveStat;
  allStats.forEach(candidateStat => {
    applyToggles(candidateStat, memo);
    if (!candidateStat.inactive) lastActiveStat = candidateStat;
    candidateStat.overridden = undefined;
  });
  if (!lastActiveStat){
    delete memo.statsByVariableName[stat.variableName];
    return;
  }
  // Make sure the active stat has all the effects and proficiencies
  lastActiveStat.computationDetails.effects = effects;
  lastActiveStat.computationDetails.proficiencies = proficiencies;

  // Update the memo's stat with the chosen stat
  memo.statsByVariableName[stat.variableName] = lastActiveStat;

  // Recreate list of the non-cannonical stats
  sameNameStats = without(allStats, lastActiveStat);

  sameNameStats.forEach(statInstance => {
    // Mark the non-cannonical stats as overridden
    statInstance.overridden = true;

    // Apply the cannonical damage
    statInstance.damage = lastActiveStat.damage;
  });

  let baseDependencies = [];
  allStats.forEach(statInstance => {
    // Add this stat and its deps to the dependencies
    baseDependencies = union(
      baseDependencies,
      [statInstance._id],
      statInstance.dependencies,
    );

    // Apply all the base proficiencies
    if (statInstance.baseProficiency && !statInstance.inactive){
      proficiencies.push({
        value: statInstance.baseProficiency,
        stats: [statInstance.variableName],
        type: 'proficiency',
        dependencies: statInstance.overridden ?
          union(statInstance.dependencies, [statInstance._id]) :
          [],
        computationDetails: {
          computed: true,
        }
      });
    }

    // Compute each active stat's baseValue calculation and apply it
    if (!statInstance.inactive) {
      let {
        result,
        context,
        dependencies
      } = evaluateCalculation({
        string: statInstance.baseValueCalculation,
        prop: statInstance,
        memo
      });
      statInstance.baseValue = +result.value;
      statInstance.dependencies = union(statInstance.dependencies, dependencies);
      if (context.errors.length){
        statInstance.baseValueErrors = context.errors;
      }
      // Apply all the base values
      effects.push({
        operation: 'base',
        calculation: statInstance.baseValueCalculation,
        result: statInstance.baseValue,
        stats: [statInstance.variableName],
        dependencies: statInstance.overridden ?
          union(statInstance.dependencies, [statInstance._id]) :
          [],
        computationDetails: {
          computed: true,
        },
      });
    }
  });

  // Compute and aggregate all the effects
  let aggregator = new EffectAggregator();
  let effectDeps = [];
  each(effects, (effect) => {
    // Compute
    computeEffect(effect, memo);
    if (effect.deactivatedByToggle) return;

    // dependencies
    if (effect._id) effectDeps = union(effectDeps, [effect._id]);
    effectDeps = union(effectDeps, effect.dependencies);

    // Add computed effect to aggregator
    aggregator.addEffect(effect);
  });

  // Combine the effects into the stats
  allStats.forEach(statInstance => {
    // Conglomerate all the effects to compute the final stat values
    combineStat(statInstance, aggregator, memo);
    // Mark the stats as computed
    statInstance.computationDetails.computed = true;
    statInstance.computationDetails.busyComputing = false;
    // Only the active stat instance depeneds on the effects
    if (!statInstance.overridden){
      statInstance.dependencies = union(statInstance.dependencies, effectDeps);
    }
  });
}
