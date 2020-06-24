import { includes, cloneDeep } from 'lodash';

// The computation memo is an in-memory data structure used only during the
// computation process
export default class ComputationMemo {
  constructor(props, creature){
    this.statsByVariableName = {};
    this.extraStatsByVariableName = {};
    this.statsById = {};
    this.originalPropsById = {};
    this.propsById = {};
    this.skillsByAbility = {};
    this.unassignedEffects = [];
    this.classLevelsById = {};
    this.classes = {};
    this.togglesById = {};
    this.toggleIds = new Set();
    // Equipped items that might be used as ammo
    this.equipmentById = {};
    // Properties that have calculations, but don't impact other properties
    this.endStepPropsById = {};
    // First note all the ids of all the toggles
    props.forEach((prop) => {
      if (
        prop.type === 'toggle'
      ) {
        this.toggleIds.add(prop._id);
      }
    });
    props.filter((prop) => {
      if (
        prop.type === 'toggle'
      ) {
        this.addToggle(prop);
      } else {
        return true;
      }
    }).filter((prop) => {
      if (
        prop.type === 'attribute' ||
        prop.type === 'skill'
      ) {
        // Add all the stats
        this.addStat(prop);
      } else if (
        prop.type === 'item'
      ) {
        this.addEquipment(prop);
      } else {
        return true;
      }
    }).forEach((prop) => {
      // Now add all effects and proficiencies
      if (prop.type === 'effect'){
        this.addEffect(prop);
      } else if (prop.type === 'proficiency') {
        this.addProficiency(prop);
      } else if (prop.type === 'classLevel'){
        this.addClassLevel(prop);
      } else {
        this.addEndStepProp(prop);
      }
    });
    for (let name in creature.denormalizedStats){
      if (!this.statsByVariableName[name]){
        this.statsByVariableName[name] = {
          variableName: name,
          value: creature.denormalizedStats[name],
          computationDetails: propDetailsByType.denormalizedStat(),
        }
      }
    }
  }
  registerProperty(prop){
    this.originalPropsById[prop._id] = cloneDeep(prop);
    this.propsById[prop._id] = prop;
    prop.computationDetails = propDetails(prop);
    prop.ancestors.forEach(ancestor => {
      if (this.toggleIds.has(ancestor.id)){
        prop.computationDetails.toggleAncestors.push(ancestor.id);
      }
    });
    return prop;
  }
  addToggle(prop){
    prop = this.registerProperty(prop);
    this.togglesById[prop._id] = prop;
  }
  addClassLevel(prop){
    prop = this.registerProperty(prop);
    this.classLevelsById[prop._id] = prop;
  }
  addStat(prop){
    let variableName = prop.variableName;
    if (!variableName) return;
    let existingStat = this.statsByVariableName[variableName];
    if (existingStat){
      existingStat.computationDetails.idsOfSameName.push(prop._id);
      this.originalPropsById[prop._id] = cloneDeep(prop);
      if (prop.baseValueCalculation){
        existingStat.computationDetails.effects.push({
          operation: 'base',
          calculation: prop.baseValueCalculation,
          stats: [variableName],
          computationDetails: propDetailsByType.effect(),
          statBase: true,
        });
      }
      if (prop.baseProficiency){
        existingStat.computationDetails.proficiencies.push({
          value: prop.baseProficiency,
          stats: [variableName],
          computationDetails: propDetailsByType.proficiency(),
          type: 'proficiency',
          statBase: true,
        });
      }
    } else {
      prop = this.registerProperty(prop);
      this.statsById[prop._id] = prop;
      this.statsByVariableName[variableName] = prop;
      if (
        prop.type === 'skill' &&
        isSkillCheck(prop) &&
        prop.ability
      ){
        this.addSkillToAbility(prop, prop.ability)
      }
    }
  }
  addSkillToAbility(prop, ability){
    if (!this.skillsByAbility[ability]){
      this.skillsByAbility[ability] = [];
    }
    this.skillsByAbility[ability].push(prop);
  }
  addEffect(prop){
    prop = this.registerProperty(prop);
    let targets = this.getEffectTargets(prop);
    targets.forEach(target => {
      if (target.computationDetails.effects){
        target.computationDetails.effects.push(prop);
      }
    });
    if (!targets.size){
      this.unassignedEffects.push(prop);
    }
  }
  getEffectTargets(prop){
    let targets = new Set();
    if (!prop.stats) return targets;
    prop.stats.forEach((statName) => {
      let target = this.statsByVariableName[statName];
      if (!target) return;
      targets.add(target);
      if (isSkillOperation(prop) && isAbility(target)){
        let extras = this.skillsByAbility[statName] || [];
        extras.forEach(ex =>{
          // Only pass on ability effects to skills and checks
          if (ex.skillType === 'skill' || ex.skillType === 'check'){
            targets.add(ex)
          }
        });
      }
    });
    return targets;
  }
  addProficiency(prop){
    prop = this.registerProperty(prop);
    let targets = this.getProficiencyTargets(prop);
    targets.forEach(target => {
      target.computationDetails.proficiencies.push(prop);
    });
  }
  getProficiencyTargets(prop){
    let targets = new Set();
    if (!prop.stats) return targets;
    prop.stats.forEach(statName => {
      let target = this.statsByVariableName[statName];
      if (!target) return;
      targets.add(target);
      if (isAbility(target)) {
        let extras = this.skillsByAbility[statName] || [];
        extras.forEach(ex =>{
          // Only pass on ability proficiencies to skills and checks
          if (ex.skillType === 'skill' || ex.skillType === 'check'){
            targets.add(ex)
          }
        });
      }
    });
    return targets;
  }
  addEquipment(prop){
    prop = this.registerProperty(prop);
    this.equipmentById[prop._id] = prop;
  }
  addEndStepProp(prop){
    prop = this.registerProperty(prop);
    this.endStepPropsById[prop._id] = prop;
  }
}

function isAbility(prop){
  return prop.type === 'attribute' &&
  prop.attributeType === 'ability'
}

function isSkillCheck(prop){
  return includes(['skill', 'check', 'save', 'utility'], prop.skillType);
}

const skillOperations = [
  'advantage',
  'disadvantage',
  'passiveAdd',
  'fail',
  'conditional',
  'rollBonus',
];

function isSkillOperation(prop){
  return skillOperations.includes(prop.operation);
}

function propDetails(prop){
  return propDetailsByType[prop.type] && propDetailsByType[prop.type]() ||
    propDetailsByType.default();
}

const propDetailsByType = {
  default(){
    return {
      toggleAncestors: [],
      disabledByToggle: false,
    };
  },
  toggle(){
    return {
      computed: false,
      busyComputing: false,
      toggleAncestors: [],
      disabledByToggle: false,
    };
  },
  attribute(){
    return {
      computed: false,
      busyComputing: false,
      effects: [],
      toggleAncestors: [],
      disabledByToggle: false,
      idsOfSameName: [],
    };
  },
  skill(){
    return {
      computed: false,
      busyComputing: false,
      effects: [],
      proficiencies: [],
      toggleAncestors: [],
      disabledByToggle: false,
      idsOfSameName: [],
    };
  },
  effect(){
    return {
      computed: false,
      busyComputing: false,
      toggleAncestors: [],
      disabledByToggle: false,
    };
  },
  classLevel(){
    return {
      computed: true,
      toggleAncestors: [],
      disabledByToggle: false,
    };
  },
  proficiency(){
    return {
      toggleAncestors: [],
      disabledByToggle: false,
    };
  },
  denormalizedStat(){
    return {
      toggleAncestors: [],
      disabledByToggle: false,
    };
  }
}
