import applyAction from '/imports/api/creature/actions/applyAction.js';
import applyAdjustment from '/imports/api/creature/actions/applyAdjustment.js';
import applyAttack from '/imports/api/creature/actions/applyAttack.js';
import applyBuff from '/imports/api/creature/actions/applyBuff.js';
import applyDamage from '/imports/api/creature/actions/applyDamage.js';
import applyRoll from '/imports/api/creature/actions/applyRoll.js';
import applyToggle from '/imports/api/creature/actions/applyToggle.js';
import applySave from '/imports/api/creature/actions/applySave.js';

function applyProperty(options){
  let prop = options.prop;
  if (prop.type === 'buff'){
    // ignore only applied buffs
    if (prop.applied === true){
      return false;
    }
  // Only ignore toggles if they wont be computed
  } else if (prop.type === 'toggle') {
    if (prop.disabled) return false;
    if (prop.enabled) return true;
    if (!prop.condition) return false;
  // Ignore inactive props of other types
  } else if (prop.deactivatedBySelf === true){
    return false;
  }
  switch (prop.type){
    case 'action':
    case 'spell':
      applyAction(options);
      break;
    case 'attack':
      applyAction(options);
      applyAttack(options);
      break;
    case 'damage':
      applyDamage(options);
      break;
    case 'adjustment':
      applyAdjustment(options);
      break;
    case 'buff':
      applyBuff(options);
      break;
    case 'toggle':
      return applyToggle(options);
    case 'roll':
      applyRoll(options);
      break;
    case 'savingThrow':
      return applySave(options);
  }
  return true;
}

function applyPropertyAndWalkChildren({prop, child, targets, ...options}){
  let shouldKeepWalking = applyProperty({ prop, targets, ...options });
  if (shouldKeepWalking){
    applyProperties({ forest: child.children, targets, ...options,});
  }
}

export default function applyProperties({ forest, targets, ...options}){
  forest.forEach(child => {
    let prop = child.node;
    if (shouldSplit(prop) && targets.length){
      targets.forEach(target => {
        let targets = [target]
        applyPropertyAndWalkChildren({ targets, prop, child, ...options});
      });
    } else {
      applyPropertyAndWalkChildren({prop, child, targets, ...options});
    }
  });
}

function shouldSplit(prop){
  if (prop.target === 'each'){
    return true;
  }
}
