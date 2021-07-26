import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import ComputationMemo from '/imports/api/creature/computation/engine/ComputationMemo.js';
import getComputationProperties from '/imports/api/creature/computation/engine/getComputationProperties.js';
import computeMemo from '/imports/api/creature/computation/engine/computeMemo.js';
import writeAlteredProperties from '/imports/api/creature/computation/engine/writeAlteredProperties.js';
import writeCreatureVariables from '/imports/api/creature/computation/engine/writeCreatureVariables.js';
import { recomputeDamageMultipliersById } from '/imports/api/creature/denormalise/recomputeDamageMultipliers.js';
import recomputeSlotFullness from '/imports/api/creature/denormalise/recomputeSlotFullness.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import getDependentProperties from '/imports/api/creature/computation/engine/getDependentProperties.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import recomputeInactiveProperties from '/imports/api/creature/denormalise/recomputeInactiveProperties.js';

export const recomputeCreature = new ValidatedMethod({

  name: 'creatures.recomputeCreature',

  validate: new SimpleSchema({
    charId: { type: String }
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run({charId}) {
    let creature = Creatures.findOne(charId);
    // Permission
    assertEditPermission(creature, this.userId);
    // Work, call this direcly if you are already in a method that has checked
    // for permission to edit a given character
    recomputeCreatureById(charId);
  },

});

export function recomputeCreatureById(creatureId){
  let creature = Creatures.findOne(creatureId);
  recomputeCreatureByDoc(creature);
}

/**
 * This function is the heart of DiceCloud. It recomputes a creature's stats,
 * distilling down effects and proficiencies into the final stats that make up
 * a creature.
 *
 * Essentially this is a depth first tree traversal algorithm that computes
 * stats' dependencies before computing stats themselves, while detecting
 * dependency loops.
 *
 * At the moment it makes no effort to limit recomputation to just what was
 * changed.
 *
 * Attempting to implement dependency management to limit recomputation to just
 * change affected stats should only happen as a last resort, when this function
 * can no longer be performed more efficiently, and server resources can not be
 * expanded to meet demand.
 *
 * A brief overview:
 * - Fetch the stats of the creature and add them to
 *   an object for quick lookup
 * - Fetch the effects and proficiencies which apply to each stat and store them with the stat
 * - Fetch the class levels and store them as well
 * - Mark each stat and effect as uncomputed
 * - Iterate over each stat in order and compute it
 *   - If the stat is already computed, skip it
 *   - If the stat is busy being computed, we are in a dependency loop, make it NaN and mark computed
 *   - Mark the stat as busy computing
 *   - Iterate over each effect which applies to the attribute
 *     - If the effect is not computed compute it
 *       - If the effect relies on another attribute, get its computed value
 *       - Recurse if that attribute is uncomputed
 *     - apply the effect to the attribute
 *   - Conglomerate all the effects to compute the final stat values
 *   - Mark the stat as computed
 * - Write the computed results back to the database
 */
export function recomputeCreatureByDoc(creature){
  const creatureId = creature._id;
  let props = getComputationProperties(creatureId);
  let computationMemo = new ComputationMemo(props, creature);
  computeMemo(computationMemo);
  writeAlteredProperties(computationMemo);
  writeCreatureVariables(computationMemo, creatureId);
  recomputeDamageMultipliersById(creatureId);
  recomputeSlotFullness(creatureId);
  return computationMemo;
}

export function recomputePropertyDependencies(property){
  let creature = getRootCreatureAncestor(property);
  recomputeCreatureByDependencies({
    creature,
    propertyIds: [property._id],
    propertiesDependedAponIds: property.dependencies,
  });
}

export function recomputeCreatureByDependencies({
  creature,
  propertyIds,
  propertiesDependedAponIds
}){
  let props = getDependentProperties({
    creatureId: creature._id,
    propertyIds,
    propertiesDependedAponIds,
  });
  let computationMemo = new ComputationMemo(props, creature);
  computeMemo(computationMemo);
  writeAlteredProperties(computationMemo);
  writeCreatureVariables(computationMemo, creature._id, false)
  recomputeInactiveProperties(creature._id);
  return computationMemo;
}
