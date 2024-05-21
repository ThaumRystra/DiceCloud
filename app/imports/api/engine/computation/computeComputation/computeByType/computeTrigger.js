import { get, set } from 'lodash';
import { getEffectTagTargets } from '/imports/api/engine/computation/buildComputation/linkTypeDependencies';

export default function computeTrigger(computation, node) {
  const prop = node.data;

  // Triggers that aren't active aren't linked to properties
  if (prop.inactive) return;

  // Link triggers to all the properties that would fire them when applied
  const tagTargets = getEffectTagTargets(prop, computation);
  for (const targetId of tagTargets) {
    const targetProp = computation.propsById[targetId];
    switch (prop.event) {
      case 'doActionProperty':
        // Only apply if the trigger matches this property type
        if (targetProp.type === prop.actionPropertyType) {
          setTrigger(prop, targetProp, 'triggerIds');
        }
        // Or on an item used as ammo
        else if (prop.actionPropertyType === 'ammo' && targetProp.type === 'item') {
          setTrigger(prop, targetProp, 'ammoTriggerIds');
        }
        break;
      case 'damageProperty':
        // Only apply to attributes
        if (targetProp.type === 'attribute') {
          setTrigger(prop, targetProp, 'damageTriggerIds');
        }
        break;
      case 'check':
        // Only apply to attributes and skills
        if (targetProp.type === 'attribute' || targetProp.type === 'skill') {
          setTrigger(prop, targetProp, 'checkTriggerIds');
        }
        break;
    }
  }
}

function setTrigger(prop, targetProp, field = 'triggerIds') {
  let triggerIdArray = get(targetProp, `${field}.${prop.timing}`);
  if (!triggerIdArray) {
    triggerIdArray = [];
    set(targetProp, `${field}.${prop.timing}`, triggerIdArray);
  }
  triggerIdArray.push(prop._id);
}