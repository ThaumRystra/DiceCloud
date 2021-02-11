import applyAction from '/imports/api/creature/actions/applyAction.js';
import applyAdjustment from '/imports/api/creature/actions/applyAdjustment.js';
import applyAttack from '/imports/api/creature/actions/applyAttack.js';
import applyDamage from '/imports/api/creature/actions/applyDamage.js';
import applyBuff from '/imports/api/creature/actions/applyBuff.js';

function applyProperty(options){
  let prop = options.prop;
  if (prop.type === 'buff'){
    // ignore only applied buffs
    if (prop.applied === true){
      return false;
    }
  // Ignore inactive props of other types
  } else if (prop.inactive === true){
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
    case 'roll':
      // applyRoll(options);
      break;
    case 'savingThrow':
      // applySavingThrow(options);
      break;
  }
  return true;
}

export default function applyProperties({
  forest,
  creature,
  targets,
  actionContext,
  log,
}){
  forest.forEach(child => {
    let walkChildren = applyProperty({
      prop: child.node,
      children: child.children,
      creature,
      targets,
      actionContext,
      log,
    });
    if (walkChildren){
      applyProperties({
        forest: child.children,
        creature,
        targets,
        actionContext,
        log,
      });
    }
  });
}
