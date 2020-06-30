import applyAction from '/imports/api/creature/actions/applyAction.js';
import applyDamage from '/imports/api/creature/actions/applyDamage.js';
import applyBuff from '/imports/api/creature/actions/applyBuff.js';

function applyProperty(options){
  let prop = options.prop;
  if (
    prop.disabled === true || // ignore disabled props
    prop.equipped === false || // ignore unequipped items
    prop.toggleResult === false || // ignore untoggled toggles
    prop.applied === true // ignore buffs that are already applied
  ){
    return false;
  }
  switch (prop.type){
    case 'action':
    case 'spell':
    case 'attack':
      applyAction(options);
      return true;
    case 'damage':
      applyDamage(options);
      return true;
    case 'adjustment':
      // applyAdjustment(options);
      return true;
    case 'buff':
      applyBuff(options);
      return false;
    case 'roll':
      // applyRoll(options);
      return true;
    case 'savingThrow':
      // applySavingThrow(options);
      return false;
  }
}

export default function applyProperties({
  forest,
  creature,
  targets,
  actionContext
}){
  forest.forEach(child => {
    let walkChildren = applyProperty({
      prop: child.node,
      children: child.children,
      creature,
      targets,
      actionContext
    });
    if (walkChildren){
      applyProperties({
        forest: child.children,
        creature,
        targets,
        actionContext
      });
    }
  });
}
