import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import Creatures from '/imports/api/creature/Creatures.js';
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';

export const recomputeDamageMultipliers = new ValidatedMethod({

  name: 'creatures.recomputeDamageMultipliers',

  validate: new SimpleSchema({
    creatureId: { type: String }
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run({creatureId}) {
    // Permission
    assertEditPermission(creatureId, this.userId);
    // Work, call this direcly if you are already in a method that has checked
    // for permission to edit a given character
    recomputeDamageMultipliersById(creatureId);
  },

});

export function recomputeDamageMultipliersById(creatureId){
  if (!creatureId) throw 'Creature ID is required';
  let props = getActiveProperties({
    ancestorId: creatureId,
    filter: {type: 'damageMultiplier'},
  });

  // Count of how many weakness, resistances and immunities each damage type has
  let multipliersByName = {};
  props.forEach(dm => {
    dm.damageTypes.forEach(damageType => {
      if (!multipliersByName[damageType]){
        multipliersByName[damageType] = {
          weaknesses: 0,
          resistances: 0,
          immunities: 0,
        };
      }
      if (dm.value === 0){
        multipliersByName[damageType].immunities++;
      } else if (dm.value === 0.5){
        multipliersByName[damageType].resistances++;
      } else if (dm.value === 2){
        multipliersByName[damageType].weaknesses++;
      }
    });
  });
  // Make an Object with keys of all the damage types that have a resulting
  // immunity, weakness, or resistance
  let damageMultipliers = {};
  for (let damageType in multipliersByName){
    let multiplier = multipliersByName[damageType];
    if (multiplier.immunities){
      damageMultipliers[damageType] = 0;
    } else if (multiplier.resistances && !multiplier.weaknesses){
      damageMultipliers[damageType] = 0.5;
    } else if (multiplier.weaknesses && !multiplier.resistances){
      damageMultipliers[damageType] = 2;
    }
  }
  // Store the Object on the creature document
  Creatures.update(creatureId, {$set: {damageMultipliers}});
}
