import { get, set } from 'lodash';
import { getEffectTagTargets } from '/imports/api/engine/computation/buildComputation/linkTypeDependencies';

export default function computeTrigger(computation, node) {
  const prop = node.data;

  // Triggers that aren't active aren't linked to properties
  if (prop.inactive) return;

  // Link triggers to all the properties that would fire them when applied
  const tagTargets = getEffectTagTargets(prop, computation);
  switch (prop.event) {
    case 'doActionProperty':
      tagTargets.forEach(targetId => {
        const targetProp = computation.propsById[targetId];
        // Only apply if the trigger matches this property type
        if (targetProp.type !== prop.actionPropertyType) return;
        setTrigger(prop, targetProp);
      });
      break;
    case 'damageProperty':
      tagTargets.forEach(targetId => {
        const targetProp = computation.propsById[targetId];
        // Only apply to attributes
        if (targetProp.type !== 'attribute') return;
        setTrigger(prop, targetProp);
      });
      break;
  }
}

function setTrigger(prop, targetProp) {
  let triggerIdArray = get(targetProp, `triggerIds.${prop.timing}`);
  if (!triggerIdArray) {
    triggerIdArray = [];
    set(targetProp, `triggerIds.${prop.timing}`, triggerIdArray);
  }
  triggerIdArray.push(prop._id);
}