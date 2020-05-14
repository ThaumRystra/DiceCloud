import { includes, cloneDeep, has } from 'lodash';

export default class ComputationMemo {
  constructor(props){
    this.statsByVariableName = {};
    this.originalPropsById = {};
    this.propsById = {};
    this.skillsByAbility = {};
    this.unassignedEffects = [];
    this.classes = {};
    props.filter((prop) => {
      // skip effects, proficiencies, and class levels for the next pass
      if (
        prop.type === 'effect' ||
        prop.type === 'proficiency' ||
        prop.type === 'classLevel'
      ) return true;
      // Add all the stats
      this.addStat(prop);
    }).forEach((prop) => {
      // Now add all effects and proficiencies
      if (prop.type === 'effect'){
        this.addEffect(prop);
      } else if (prop.type === 'proficiency') {
        this.addProficiency(prop);
      } else if (prop.type === 'classLevel'){
        this.addClassLevel(prop);
      }
    });
  }
  registerProperty(prop){
    this.originalPropsById[prop._id] = cloneDeep(prop);
    this.propsById[prop._id] = prop;
    prop.computationDetails = propDetails(prop);
    return prop;
  }
  storeHighestClassLevel(name, prop, isBaseClass){
    // Only store the highest level classLevel
    let stat = this.statsByVariableName[name]
    if (!stat){
      this.statsByVariableName[name] = prop;
      if (isBaseClass){
        this.classes[name] = prop;
      }
    } else if (!has(stat, 'level')){
      // Stat is overriden by an attribute
      return;
    } else if (stat.level < prop.level) {
      this.statsByVariableName[name] = prop;
      if (isBaseClass){
        this.classes[name] = prop;
      }
    }
    this.updateLevel();
  }
  updateLevel(){
    let currentLevel = this.statsByVariableName['level'];
    if (!currentLevel){
      currentLevel = {
        value: 0,
        computationDetails: {
          builtIn: true,
          computed: true,
        }
      };
      this.statsByVariableName['level'] = currentLevel;
    }
    // bail out if overriden by an attribute
    if (!currentLevel.computationDetails.builtIn) return;
    let level = 0;
    for (let name in this.classes){
      level += this.classes[name].level || 0;
    }
    this.statsByVariableName['level'].value = level;
  }
  addClassLevel(prop){
    prop = this.registerProperty(prop);
    if (prop.variableName){
      this.storeHighestClassLevel(prop.variableName, prop);
    }
    if (prop.baseClass){
      this.storeHighestClassLevel(prop.baseClass, prop, true);
    }
  }
  addStat(prop){
    prop = this.registerProperty(prop);
    let variableName = prop.variableName;
    if (!variableName) return;
    if (this.statsByVariableName[variableName]){
      prop.value = NaN;
      prop.computationDetails.error = 'variableNameCollision';
      console.warn('variableNameCollision', prop);
      return;
    }
    this.statsByVariableName[variableName] = prop;
    if (
      prop.type === 'skill' &&
      isSkillCheck(prop) &&
      prop.ability
    ){
      this.addSkillToAbility(prop, prop.ability)
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
      target.computationDetails.effects.push(prop);
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
        targets.add(...extras)
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
      if (isAbility(target) && isSkillCheck(prop)) {
        let extras = this.skillsByAbility[statName] || [];
        targets.add(...extras)
      }
    });
    return targets;
  }
}

const skillOperations = [
  'advantage',
  'disadvantage',
  'passiveAdd',
  'fail',
  'conditional',
  'rollBonus',
];

function isAbility(prop){
  return prop.type === 'attribute' &&
  prop.attributeType === 'ability'
}

function isSkillCheck(prop){
  return includes(['skill', 'check', 'save', 'utility'], prop.skillType);
}

function isSkillOperation(prop){
  return skillOperations.includes(prop.operation);
}

function propDetails(prop){
  return propDetailsByType[prop.type]() || {};
}

const propDetailsByType = {
  attribute(){
    return {
      computed: false,
      busyComputing: false,
      effects: [],
    };
  },
  skill(){
    return {
      computed: false,
      busyComputing: false,
      effects: [],
      proficiencies: [],
    };
  },
  effect(){
    return {
      computed: false,
    };
  },
  classLevel(){
    return {
      computed: true,
    };
  },
  proficiency(){
    return {};
  },
  damageMultiplier(){
    return {};
  },
}
