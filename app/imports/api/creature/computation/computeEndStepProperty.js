import evaluateCalculation from '/imports/api/creature/computation/evaluateCalculation.js';

export default function computeEndStepProperty(prop, memo){
  switch (prop.type){
    case 'action':
    case 'spell':
      computeAction(prop, memo);
      break;
    case 'attack':
      computeAction(prop, memo);
      computeAttack(prop, memo);
      break;
    case 'savingThrow':
      computeSavingThrow(prop, memo);
      break;
    case 'spellList':
      computeSpellList(prop, memo);
      break;
  }
}

function computeAction(prop, memo){
  let {value, errors} = evaluateCalculation(prop.uses, memo);
  prop.usesResult = value;
  if (errors.length){
    prop.usesErrors = errors;
  } else {
    delete prop.usesErrors;
  }
  // TODO compute resources.$.$.available and insufficientResources
}

function computeAttack(prop, memo){
  let {value, errors} = evaluateCalculation(prop.rollBonus, memo);
  prop.rollBonusResult = value;
  if (errors.length){
    prop.rollBonusErrors = errors;
  } else {
    delete prop.rollBonusErrors;
  }
}

function computeSavingThrow(prop, memo){
  let {value, errors} = evaluateCalculation(prop.dc, memo);
  prop.dcResult = value;
  if (errors.length){
    prop.dcErrors = errors;
  } else {
    delete prop.dcErrors;
  }
}

function computeSpellList(prop, memo){
  let {value, errors} = evaluateCalculation(prop.maxPrepared, memo);
  prop.maxPreparedResult = value;
  if (errors.length){
    prop.maxPreparedErrors = errors;
  } else {
    delete prop.maxPreparedErrors;
  }
}
