import { get, set } from 'lodash';
import { getEffectTagTargets } from '/imports/api/engine/computation/buildComputation/linkTypeDependencies';

export default function computeTrigger(computation, node) {
  const prop = node.data;

  // Triggers that aren't active aren't linked to properties
  if (prop.inactive) return;

  // Link triggers to all the properties that would fire them when applied
  if (prop.event === 'doActionProperty') {
    getEffectTagTargets(prop, computation).forEach(targetId => {
      const targetProp = computation.propsById[targetId];
      // Only apply if the trigger matches this property type
      if (targetProp.type !== prop.actionPropertyType) return;
      let triggerIdArray = get(targetProp, `triggerIds.${prop.timing}`);
      if (!triggerIdArray) {
        triggerIdArray = [];
        set(targetProp, `triggerIds.${prop.timing}`, triggerIdArray);
      }
      triggerIdArray.push(prop._id);
    });
  }
}
