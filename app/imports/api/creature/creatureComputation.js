// TODO allow abilities to get advantage/disadvantage, making all skills that are based
// on them disadvantaged as well

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import Creatures from "/imports/api/creature/Creatures.js";
import CreatureProperties from "/imports/api/creature/CreatureProperties.js";
import * as math from 'mathjs';
import { includes } from 'lodash';

export const recomputeCreature = new ValidatedMethod({

  name: "Creatures.methods.recomputeCreature",

  validate: new SimpleSchema({
    charId: { type: String }
  }).validator(),

  run({charId}) {
    // Permission
    assertEditPermission(charId, this.userId);
    // Work, call this direcly if you are already in a method that has checked
    // for permission to edit a given character
    recomputeCreatureById(charId);
  },

});

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
export function recomputeCreatureById(creatureId){
  let char = buildCreature(creatureId);
  char = computeCreature(char);
  writeCreature(char);
  return char;
}

// Load creature details into memory from database
function buildCreature(creatureId){
  let char = {
    id: creatureId,
    stats: {},
    skillsByAbility: {},
    unassignedEffects: [],
    computedEffects: [],
  };
  // Get all relevant properties and store them on the in-memory creature
  getCreatureProps(creatureId).filter(prop => {
    const key = prop.variableName;
    switch(prop.type){
      case 'attribute':
      case 'skill':
        let skill = statObject(prop);
        // Store the skill as a stat on the in-memory creature
        if (!char.stats[key]) char.stats[key] = skill;
        // Store a reference to the skill under the relevant ability as well
        if (skill.ability){
          if (!char.skillsByAbility[skill.ability]){
            char.skillsByAbility[skill.ability] = [];
          }
          char.skillsByAbility[skill.ability].push(skill);
        }
        return false;
      case 'damageMultiplier':
        if (!char.stats[key]) char.stats[key] = damageMultiplierObject();
        return false;
      default:
        return true;
    }
  }).forEach(prop => {
    // In a second pass through the props, assign effects and proficiencies to
    // their matched attributes and skills
    switch(prop.type){
      case 'effect':
        let effect = effectObject(prop);
        // Assign the effect to all the stats it directly targets
        let targets = getEffectTargets(char, effect);
        targets.forEach(target =>
          target.effects.push(effect)
        );
        if (!targets.length){
          char.unassignedEffects.push(effect);
        }
        break;
      case 'proficiency':
        let proficiency = proficiencyObject(prop);
        getProficiencyTargets(char, proficiency).forEach(target =>
          target.proficiencies.push(proficiency)
        );
        break;
      }
  });
  // Add direct properties from creature to variable list
  const fields = { xp: 1, weightCarried: 1, level: 1};
  const creature = Creatures.findOne(creatureId, {fields});
  for (let key in fields){
    if (!char.stats[key]){
      char.stats[key] = {
        computed: true,
        type: 'creatureProperty',
        result: creature[key] || 0,
      };
    }
  }
  return char;
}

function getCreatureProps(creatureId){
  // First get ids of disabled properties and unequiped items
  let disabledAncestorIds = CreatureProperties.find({
    'ancestors.id': creatureId,
    $or: [
      {disabled: true},
      {equipped: false},
    ],
  }, {
    fields: {_id: 1},
  }).map(prop => prop._id);

  // Then get the ids of creatures that are children of this creature
  // to isolate their decendent properties from this calculation
  Creatures.find({
    'ancestors.id': creatureId,
  }, {
    fields: {_id: 1},
  }).forEach(prop => {
    disabledAncestorIds.push(prop._id);
  });

  // Get all the properties that aren't from the excluded decendents
  return CreatureProperties.find({
    'ancestors.id': {
      $eq: creatureId,
      $nin: disabledAncestorIds,
    },
    type: {$in: [
      'attribute',
      'skill',
      'damageMultiplier',
      'effect',
      'proficiency',
    ]},
  }).fetch();
}

function getProficiencyTargets(char, proficiency){
  let extraTargets = [];
  if (!proficiency.stats) return [];
  let targets = proficiency.stats.map(targetStat => {
    let target = char[targetStat];
    // Proficiencies targeting ability scores apply to 'skill' and check' skills
    // based on that ability as well
    if (
      target &&
      target.type === 'attribute' &&
      target.attributeType === 'ability' &&
      char.skillsByAbility[targetStat]
    ) {
      extraTargets.push(
        ...char.skillsByAbility[targetStat].filter(skill =>
          includes(['skill', 'check'], skill.skillType)
        )
      );
    }
    return target;
  }).filter(target => !!target);
  return targets.concat(extraTargets);
}

function getEffectTargets(char, effect){
  const skillOperations = [
    'advantage',
    'disadvantage',
    'passiveAdd',
    'fail',
    'conditional',
    'rollBonus',
  ];
  let extraTargets = [];
  if (!effect.stats) return [];
  let targets = effect.stats.map(targetStat => {
    let target = char[targetStat];
    // Certain effects targeting ability scores apply to  skills
    // based on that ability as well
    if (
      includes(skillOperations, effect.operation) &&
      target &&
      target.type === 'attribute' &&
      target.attributeType === 'ability' &&
      char.skillsByAbility[targetStat]
    ) {
      extraTargets.push(...char.skillsByAbility[targetStat]);
    }
    return target;
  });
  return targets.concat(extraTargets);
}

function statObject(prop){
  return {
    computed: false,
    busyComputing: false,
    type: prop.type,
    attributeType: prop.attributeType,
    skillType: prop.skillType,
    ability: prop.ability,
    base: prop.baseValue || 0,
    proficiency: prop.baseProficiency || 0,
    decimal: prop.decimal,
    result: 0,
    mod: 0, // The resulting modifier if this is an ability
    add: 0,
    mul: 1,
    min: Number.NEGATIVE_INFINITY,
    max: Number.POSITIVE_INFINITY,
    advantage: 0,
    disadvantage: 0,
    passiveAdd: 0,
    fail: 0,
    conditional: 0,
    rollBonuses: 0,
    effects: [],
    proficiencies: [],
  };
}

function damageMultiplierObject(){
  return {
    computed: false,
    busyComputing: false,
    type: "damageMultiplier",
    result: 0,
    immunityCount: 0,
    ressistanceCount: 0,
    vulnerabilityCount: 0,
    effects: [],
  };
};

function effectObject(prop){
  return {
    _id: prop._id,
    computed: false,
    result: 0,
    operation: prop.operation,
    calculation: prop.calculation,
  };
}

function proficiencyObject(prop){
  return {
    value: prop.value,
  };
}

function computeCreature(char){
  for (let statName in char.stats){
    let stat = char.stats[statName];
    computeStat (stat, char);
  }
  for (let effect of char.unassignedEffects){
    computeEffect(effect, char);
  }
  return char;
}

function computeStat(stat, char){

  // If the stat is already computed, skip it
  if (stat.computed) return;

  // If the stat is busy being computed, make it NaN and mark computed
  if (stat.busyComputing){
    // Trying to compute this stat again while it is already computing.
    // We must be in a dependency loop.
    stat.computed = true;
    stat.result = NaN;
    stat.busyComputing = false;
    return;
  }

  // Iterate over each effect which applies to the stat
  for (let i in stat.effects){
    computeEffect(stat.effects[i], char);
    // apply the effect to the stat
    applyEffect(stat.effects[i], stat);
  }

  // Conglomerate all the effects to compute the final stat values
  combineStat(stat, char);

  // Mark the attribute as computed
  stat.computed = true;
  stat.busyComputing = false;
}

/**
 * Compute a the result of a single effect
 */
function computeEffect(effect, char){
 if (effect.computed) return;
 if (_.isFinite(effect.calculation)){
   effect.result = +effect.calculation;
 } else if(effect.operation === "conditional" || effect.operation === "rollBonuses"){
   effect.result = effect.calculation;
 } else if(_.contains(["advantage", "disadvantage", "fail"], effect.operation)){
   effect.result = 1;
 } else {
   effect.result = evaluateCalculation(effect.calculation, char);
 }
 effect.computed = true;
 char.computedEffects.push(effect);
}

/**
 * Apply a computed effect to its stat
 */
function applyEffect(effect, stat){
  if (!_.has(stat, effect.operation)){
    return;
  }
  switch(effect.operation){
    case "base":
      // Take the largest base value
      stat.base = effect.result > stat.base ? effect.result : stat.base;
      break;
    case "add":
      // Add all adds together
      stat.add += effect.result;
      break;
    case "mul":
      // Multiply the muls together
      stat.mul *= effect.result;
      break;
    case "min":
      // Take the largest min value
      stat.min = effect.result > stat.min ? effect.result : stat.min;
      break;
    case "max":
      // Take the smallest max value
      stat.max = effect.result < stat.max ? effect.result : stat.max;
      break;
    case "advantage":
      // Sum number of advantages
      stat.advantage++;
      break;
    case "disadvantage":
      // Sum number of disadvantages
      stat.disadvantage++;
      break;
    case "passiveAdd":
      // Add all passive adds together
      stat.passiveAdd += effect.result;
      break;
    case "fail":
      // Sum number of fails
      stat.fail++;
      break;
    case "conditional":
      // Sum number of conditionals
      stat.conditional++;
      break;
    case "rollBonus":
      // Sum number of roll bonuses
      stat.rollBonus++;
      break;
  }
}

/**
 * Combine the results of multiple effects to get the result of the stat
 */
function combineStat(stat, char){
  if (stat.type === "attribute"){
    combineAttribute(stat, char);
  } else if (stat.type === "skill"){
    combineSkill(stat, char);
  } else if (stat.type === "damageMultiplier"){
    combineDamageMultiplier(stat, char);
  }
}

/**
 * combineAttribute - Combine attributes's results into final values
 */
function combineAttribute(stat, char){
  stat.result = (stat.base + stat.add) * stat.mul;
  if (stat.result < stat.min) stat.result = stat.min;
  if (stat.result > stat.max) stat.result = stat.max;
  if (!stat.decimal) stat.result = Math.floor(stat.result);
  if (stat.attributeType === "ability") {
    stat.mod = Math.floor((stat.result - 10) / 2);
  }
}

/**
 * Combine skills results into final values
 */
function combineSkill(stat, char){
  // Skills are based on some ability Modifier
  let abilityMod = 0;
  let ability = char.stats[stat.ability]
  if (stat.ability && ability){
    if (!ability.computed){
      computeStat(ability, char);
    }
    stat.abilityMod = ability.mod;
  }
  // Combine all the child proficiencies
  for (let i in stat.proficiencies){
    let prof = stat.proficiencies[i];
    if (prof.value > stat.proficiency) stat.proficiency = prof.value;
  }
  // Get the character's proficiency bonus to apply
  let profBonus;
  if (char.stats.proficiencyBonus){
    if (!char.stats.proficiencyBonus.computed){
      computeStat(char.stats.proficiencyBonus, char);
    }
    profBonus = char.stats.proficiencyBonus.result;
  } else {
    profBonus = Math.floor(char.level / 4 + 1.75);
  }
  // Multiply the proficiency bonus by the actual proficiency
  profBonus *= stat.proficiency;
  // Combine everything to get the final result
  stat.result = (abilityMod + profBonus + stat.add) * stat.mul;
  if (stat.result < stat.min) stat.result = stat.min;
  if (stat.result > stat.max) stat.result = stat.max;
  stat.result = Math.floor(stat.result);
  if (stat.base > stat.result) stat.result = stat.base;
}

/**
 * Combine damageMultiplier's results into final values
 */
function combineDamageMultiplier(stat){
  if (stat.immunityCount) return 0;
  if (stat.ressistanceCount && !stat.vulnerabilityCount){
    stat.result = 0.5;
  }  else if (!stat.ressistanceCount && stat.vulnerabilityCount){
    stat.result = 2;
  } else {
    stat.result = 1;
  }
}

/**
 * Get the value of a key, compute it if necessary
 */
function getComputedValueOfKey(sub, char){
  const stat = char.stats[sub];
  if (!stat) return null;
  if (!stat.computed){
    computeStat(stat, char);
  }
  return stat.result;
}

/**
 * Evaluate a string computation in the context of a char
 */
function evaluateCalculation(string, char){
  if (!string) return string;
  // Parse the string using mathjs
  let calc;
  try {
    calc = math.parse(string);
  } catch (e) {
    return string;
  }
  // Replace all symbols with known values
  let substitutedCalc = calc.transform(node => {
    if (node.isSymbolNode) {
      let val = getComputedValueOfKey(node.name, char);
      if (val === null) return node;
      return new math.expression.node.ConstantNode(val);
    }
    else {
      return node;
    }
  });

  // Evaluate the expression to a number or return with substitutions
  try {
    return substitutedCalc.eval();
  } catch (e){
    return substitutedCalc.toString();
  }
}

function writeCreature(char) {
  //TODO these functions don't filter the stats before trying to write
  writeAttributes(char);
  writeSkills(char);
  writeDamageMultipliers(char);
  writeEffects(char);
}

/*
 * Write all the attributes from the in-memory char object to the Attirbute docs
 */
function writeAttributes(char) {
  let bulkWriteOps = _.map(char.atts, (att, variableName) => {
    let op = {
      updateMany: {
        filter: {'ancestors.id': char.id, variableName},
        update: {'$set': {
          value: att.result,
          rollBonuses: skill.rollBonus,
        }},
      }
    };
    if (typeof att.mod === 'number'){
      op.updateMany.update.$set.mod = att.mod;
    } else {
      op.updateMany.update.$unset = {mod: 1};
    }
    return op;
  });
  bulkWriteProperties({bulkWriteOps, selectorType: 'attribute'});
}

function writeSkills(char) {
  let bulkWriteOps =  _.map(char.skills, (skill, variableName) => {
    let op = {
      updateMany: {
        filter: {'ancestors.id': char.id, variableName},
        update: {$set: {
          value: skill.result,
          abilityMod: skill.abilityMod,
          advantage: skill.advantage,
          passiveBonus: skill.passiveAdd,
          proficiency: skill.proficiency,
          conditionalBenefits: skill.conditional,
          rollBonuses: skill.rollBonus,
          fail: skill.fail,
        }},
      }
    };
    return op;
  });
  bulkWriteProperties({bulkWriteOps, selectorType: 'skill'});
}

function writeDamageMultipliers(char) {
  let bulkWriteOps =  _.map(char.dms, (dm, variableName) => {
    let op = {
      updateMany: {
        filter: {'ancestors.id': char.id, variableName},
        update: {$set: {
          value: dm.result,
        }},
      }
    };
    return op;
  });
  bulkWriteProperties({bulkWriteOps, selectorType: 'damageMultiplier'});
}

function writeEffects(char){
  let bulkWriteOps =  _.map(char.computedEffects, effect => ({
    updateOne: {
      filter: {_id: effect._id},
      update: {$set: {
        result: effect.result,
      }},
    },
  }));
  if (!bulkWriteOps.length) return;
  bulkWriteProperties({bulkWriteOps, selectorType: 'effect'});
}

function bulkWriteProperties({bulkWriteOps, selectorType}){
  if (!bulkWriteOps.length) return;
  if (Meteor.isServer){
    CreatureProperties.rawCollection().bulkWrite(bulkWriteOps, {ordered : false}, function(e){
      if (e) console.error(e);
    });
  } else {
    _.each(bulkWriteOps, op => {
      CreatureProperties.update(op.updateMany.filter, op.updateMany.update, {
        multi: true,
        selector: {type: selectorType}
      });
    });
  }
}
