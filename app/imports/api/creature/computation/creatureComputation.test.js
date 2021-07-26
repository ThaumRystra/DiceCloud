import {computeCreature} from "./recomputeCreature.js";
import assert from "assert";

const makeEffect = function(operation, value){
  let effect = {computed: false, result: 0, operation}
  if (_.isFinite(value)){
    effect.value = +value;
  } else {
    effect.calculation = value;
  }
  return effect;
}

describe('computeCreature', function () {
  it('computes an aritrary creature', function () {
    let char = {
      atts: {
        attribute1: {
          computed: false,
          busyComputing: false,
          type: "attribute",
          attributeType: "ability",
          result: 0,
          mod: 0, // The resulting modifier if this is an ability
          base: 0,
          add: 0,
          mul: 1,
          min: Number.NEGATIVE_INFINITY,
          max: Number.POSITIVE_INFINITY,
          effects: [
            makeEffect("base", 10),
            makeEffect("add", 5),
            makeEffect("mul", 2),
          ],
        },
        attribute2: {
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
          effects: [
            makeEffect("base", "attribute1"),
            makeEffect("max", 2),
          ],
        },
      },
      skills: {
        skill1: {
          computed: false,
          busyComputing: false,
          type: "skill",
          ability: "attribute1",
          result: 0,
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
        },
      },
      dms: {
        dm1: {
          computed: false,
          busyComputing: false,
          type: "damageMultiplier",
          result: 0,
          immunityCount: 0,
          ressistanceCount: 0,
          vulnerabilityCount: 0,
          effects: [],
        }
      },
      classes: {
        Barbarian: {
          level: 5,
        },
      },
      level: 5,
    };
    char = computeCreature(char);
    console.log(char);
    assert(true);
  });
});
