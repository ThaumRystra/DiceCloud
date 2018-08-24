// TODO make sure all attributes can only have lowercase, stripped, no spaced names
// TODO make sure proficiencies are indexed by type
// TODO skills rely on an ability's modifier
import { ValidatedMethod } from 'meteor/mdg:validated-method';

const recomputeCharacter = new ValidatedMethod({

  name: "Characters.methods.recomputeCharacter", // DDP method name

  validate: new SimpleSchema({
    charId: { type: String }
  }).validator(),

  applyOptions: {
    noRetry: true,
  },

  run({ charId }) {
    // `this` is the same method invocation object you normally get inside
    // Meteor.methods
    if (!canEditCharacter(charId, this.userId)) {
      // Throw errors with a specific error code
      throw new Meteor.Error('Characters.methods.recomputeCharacter.denied',
      'You do not have permission to recompute this character');
    }

    computeCharacterById(charId);

  },

});

/*
 * This function is the heart of DiceCloud. It recomputes a character's stats,
 * distilling down effects and proficiencies into the final stats that make up
 * a character.
 *
 * Essentially this is a backtracking algorithm that computes stats'
 * dependencies before computing stats themselves, while detecting
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
 * - Fetch the stats of the character and add them to
 *   an object for quick lookup
 * - Fetch the effects and proficiencies which apply to each stat and store them with the stat
 * - Fetch the class levels and store them as well
 * - Mark each stat and effect as uncomputed
 * - Iterate over each stat in order and compute it
 *   - If the stat is already computed, skip it
 *   - If the stat is busy being computed, make it NaN and mark computed
 *   - Mark the stat as busy computing
 *   - Iterate over each effect which applies to the attribute
 *     - If the effect is not computed compute it
 *       - If the effect relies on another attribute, get its computed value
 *       - Recurse if that attribute is uncomputed
 *     - apply the effect to the attribute
 *   - Conglomerate all the effects to compute the final attribute values
 *   - Mark the attribute as computed
 */
const computeCharacterById = function (charId){
  let char = buildCharacter();
  char = computeCharacter(char);
};

/*
 * Get the character's data from the database and build an in-memory model that
 * can be computed. Hits 6 database tables with indexed queries.
 */
const buildCharacter = function (charId){
  let char = {
    atts: {},
    skills: {},
    dms: {},
    classes: {},
    level: 0,
  };
  // Fetch the attributes of the character and add them to an object for quick lookup
  Attributes.find({charId}).forEach(attribute => {
    if (!char.atts[attribute.name]){
      char.atts[attribute.name] = {
        computed: false,
        busyComputing: false,
        type: "attribute",
        result: 0,
        mod: 0, // The resulting modifier if this is an ability
        base: 0,
        add: 0,
        mul: 1,
        min: Number.NEGATIVE_INFINITY,
        max: Number.POSITIVE_INFINITY,
        effects: [],
      };
    }
  });

  // Fetch the skills of the character and store them
  Skills.find({charId}).forEach(skill => {
    if (!char.skills[skill.name]){
      char.skills[skill.name] = {
        computed: false,
        busyComputing: false,
        type: "skill",
        ability: skill.ability,
        result: 0, // For skills the result is the skillMod
        proficiency: 0,
        add: 0,
        mul: 1,
        min: Number.NEGATIVE_INFINITY,
        max: Number.POSITIVE_INFINITY,
        advantage: 0,
        disadvantage: 0,
        passiveAdd: 0,
        fail: 0,
        conditional: 0,
        effects: [],
        proficiencies: [],
      };
    }
  });

  // Fetch the damage multipliers of the character and store them
  DamageMultipliers.find({charId}).forEach(damageMultiplier =>{
    if (!char.dms[damageMultiplier.name]){
      char.dms[damageMultiplier.name] = {
        computed: false,
        busyComputing: false,
        type: "damageMultiplier",
        result: 0,
        immunityCount: 0,
        ressistanceCount: 0,
        vulnerabilityCount: 0,
        effects: [],
      };
    }
  });

  // Fetch the class levels and store them
  // don't use the word "class" it's reserved
  Classes.find({charId}).forEach(cls => {
    if (!char.classes[cls.name]){
      char.classes[cls.name] = {level: cls.level};
      char.level += cls.level;
    }
  });

  // Fetch the effects which apply to each stat and store them under the attribute
  Effects.find({
    charId: charId,
    enabled: true,
  }).forEach(effect => {
    let storedEffect = {
      computed: false,
      result: 0,
      operation: effect.operation,
      value: effect.value,
      calculation: effect.calculation,
    }
    if (char.atts[effect.stat]) {
      char.atts[effect.stat].effects.push(storedEffect);
    } else if (char.skills[effect.stat]) {
      char.skills[effect.stat].effects.push(storedEffect);
    } else if (char.dms[effect.stat]) {
      char.dms[effect.stat].effects.push(storedEffect);
    } else {
      // ignore effects that don't apply to an actual stat
    }
  });

  // Fetch the proficiencies and store them under each skill
  Proficiencies.find({
    charId: charId,
    enabled: true,
    type: {$in: ["skill", "save"]}
  }).forEach(proficiency => {
    if (char.skills[proficiency.name]) {
      char.skills[proficiency.name].proficiencies.push(effect);
    }
  });
  return char;
}

/*
 * Compute the character's stats in-place, returns the same char object
 */
export const computeCharacter = function (char){
  // Iterate over each stat in order and compute it
  for (statName in char.atts){
    let stat = char.atts[statName]
    computeStat (stat, char);
  }
  for (statName in char.skills){
    let stat = char.skills[statName]
    computeStat (stat, char);
  }
  for (statName in char.dms){
    let stat = char.dms[statName]
    computeStat (stat, char);
  }
  return char;
}

/*
 * Compute a single stat on a character
 */
const computeStat = function(stat, char){
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
  for (i in stat.effects){
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

/*
 * Compute a single effect on a character
 */
const computeEffect = function(effect, char){
  if (effect.computed) return;
  if (_.isFinite(effect.value)){
		effect.result = effect.value;
	} else if(effect.operation === "conditional"){
    effect.result = effect.calculation;
  } else if(_.contains(["advantage", "disadvantage", "fail"], effect.operation)){
    effect.result = 1;
  } else if (_.isString(effect.calculation)){
		effect.result = evaluateCalculation(effect.calculation, char);
	}
  effect.computed = true;
  console.log({effect});
};

/*
 * Apply a computed effect to its stat
 */
const applyEffect = function(effect, stat){
  // Take the largest base value
  if (effect.operation === "base"){
    if (!_.has(stat, "base")) return;
    stat.base = effect.result > stat.base ? effect.result : stat.base;
  }
  // Add all adds together
  else if (effect.operation === "add"){
    if (!_.has(stat, "add")) return;
    stat.add += effect.result;
  }
  else if (effect.operation === "mul"){
    if (!_.has(stat, "mul")) return;
    if (stat.type === "damageMultiplier"){
      if (value === 0) stat.immunityCount++;
      else if (value === 0.5) stat.ressistanceCount++;
      else if (value === 2) stat.vulnerabilityCount++;
    } else {
      // Multiply all muls together
      stat.mul *= effect.result;
    }
  }
  // Take the largest min value
  if (effect.operation === "min"){
    if (!_.has(stat, "min")) return;
    stat.min = effect.result > stat.min ? effect.result : stat.min;
  }
  // Take the smallest max value
  if (effect.operation === "max"){
    if (!_.has(stat, "max")) return;
    stat.max = effect.result < stat.max ? effect.result : stat.max;
  }
  // Sum number of advantages
  else if (effect.operation === "advantage"){
    if (!_.has(stat, "advantage")) return;
    stat.advantage++;
  }
  // Sum number of disadvantages
  else if (effect.operation === "disadvantage"){
    if (!_.has(stat, "disadvantage")) return;
    stat.disadvantage++;
  }
  // Add all passive adds together
  else if (effect.operation === "passiveAdd"){
    if (!_.has(stat, "passiveAdd")) return;
    stat.passiveAdd += effect.result;
  }
  // Sum number of fails
  else if (effect.operation === "fail"){
    if (!_.has(stat, "fail")) return;
    stat.fail++;
  }
  // Sum number of conditionals
  else if (effect.operation === "conditional"){
    if (!_.has(stat, "conditional")) return;
    stat.conditional++;
  }
};

/*
 * Combine the results of multiple effects to get the result of the stat
 */
const combineStat = function(stat, char){
  if (stat.type === "attribute"){
    combineAttribute(stat, char)
  } else if (stat.type === "skill"){
    combineSkill(stat, char)
  } else if (stat.type === "damageMultiplier"){
    combineDamageMultiplier(stat, char);
  }
}

const combineAttribute = function(stat, char){
  stat.result = (stat.base + stat.add) * stat.mul;
  if (stat.result < stat.min) stat.result = stat.min;
  if (stat.result > stat.max) stat.result = stat.max;
  // Round everything that isn't the carry multiplier
  if (!stat.decimal) stat.result = Math.floor(stat.result);
  if (stat.attributeType === "ability") {
    stat.mod = Math.floor((stat.result - 10) / 2);
  }
  console.log({statResult: stat.result})
}

const combineSkill = function(stat, char){
  for (i in stat.proficiencies){
    let prof = stat.proficiencies[i];
    if (prof.value > stat.proficiency) stat.proficiency = prof.value;
  }
  let profBonus;
  if (char.atts.proificiencyBonus){
    if (!char.atts.proficiencyBonus.computed){
      computeStat(char.atts.proficiencyBonus, char);
    }
    profBonus = char.atts.proficiencyBonus.result;
  } else {
    profBonus = Math.floor(char.level / 4 + 1.75);
  }
  profBonus *= stat.proficiency;
  // Skills are based on some ability Modifier
  let abilityMod = 0;
  if (stat.ability && char.atts[stat.ability]){
    if (!char.atts[stat.ability].computed){
      computeStat(char.atts[stat.ability], char);
    }
    abilityMod = char.atts[stat.ability].mod;
  }
  stat.result = (abilityMod + profBonus + stat.add) * stat.mul;
  if (stat.result < stat.min) stat.result = stat.min;
  if (stat.result > stat.max) stat.result = stat.max;
  stat.result = Math.floor(stat.result);
}

const combineDamageMultiplier = function(stat, char){
  if (stat.immunityCount) return 0;
  if (stat.ressistanceCount && !stat.vulnerabilityCount){
    stat.result = 0.5;
  }  else if (!stat.ressistanceCount && stat.vulnerabilityCount){
    stat.result = 2;
  } else {
    stat.result = 1;
  }
}

// Evaluate a string computation
const evaluateCalculation = function(string, char){
  if (!string) return string;

  // Replace all the string variables with numbers if possible
  string = string.replace(/\b[a-z,1-9]+\b/gi, function(sub){
    // Make case insensitive
    sub = sub.toLowerCase()
    // Attributes
    if (char.atts[sub]){
      if (!char.atts[sub].computed){
        computeStat(char.atts[sub], char);
      }
      return char.atts[sub].result;
    }
    // Modifiers
    if (/^\w+mod$/.test(sub)){
      var slice = sub.slice(0, -3);
      if (char.atts[slice]){
        if (!char.atts[slice].computed){
          computeStat(char.atts[sub], char);
        }
        return char.atts[slice].mod || NaN;
      }
    }
    // Skills
    if (char.skills[sub]){
      if (!char.skills[sub].computed){
        computeStat(char.skills[sub], char);
      }
      return char.skills[sub].result;
    }
    // Damage Multipliers
    if (char.dms[sub]){
      if (!char.dms[sub].computed){
        computeStat(char.dms[sub], char);
      }
      return char.dms[sub].result;
    }
    // Class levels
    if (/^\w+levels?$/.test(sub)){
      //strip out "level(s)"
      var className = sub.replace(/levels?$/, "");
      return char.classes[className] && char.classes[className].level || sub;
    }
    // Character level
    if (sub  === "level"){
      return char.level;
    }
    // Give up
    return sub;
  });

  // Evaluate the expression to a number or return it as is.
  try {
    var result = math.eval(string); // math.eval is safe
    return result;
  } catch (e){
    return string;
  }
};
