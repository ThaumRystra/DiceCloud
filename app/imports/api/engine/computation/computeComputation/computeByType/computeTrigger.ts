import { getEffectTagTargets } from '/imports/api/engine/computation/buildComputation/linkTypeDependencies';
import CreatureComputation from '/imports/api/engine/computation/CreatureComputation';
import { CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';

export default function computeTrigger(computation: CreatureComputation, node: { data: CreaturePropertyTypes['trigger'] }) {
  const prop = node.data;

  // Triggers that aren't active aren't linked to properties
  if (prop.inactive) return;

  // Link triggers to all the properties that would fire them when applied
  let tagTargets: string[] = getEffectTagTargets(prop, computation);
  // If we have no tags or extra tags, target everything
  if (!prop.targetTags?.length && !prop.extraTags?.length) {
    tagTargets = computation.props.map(targetProp => targetProp._id).filter(id => id !== prop._id);
  }
  for (const targetId of tagTargets) {
    const targetProp = computation.propsById[targetId];
    switch (prop.event) {
      case 'doActionProperty':
        // Only apply if the trigger matches this property type
        if (targetProp.type === prop.actionPropertyType) {
          targetProp.triggerIds ??= {};
          (targetProp.triggerIds[prop.timing] ??= []).push(prop._id);
        }
        // Or on an item used as ammo
        else if (prop.actionPropertyType === 'ammo' && targetProp.type === 'item') {
          targetProp.ammoTriggerIds ??= {};
          (targetProp.ammoTriggerIds[prop.timing] ??= []).push(prop._id);
        }
        break;
      case 'damageProperty':
        // Only apply to attributes
        if (targetProp.type === 'attribute') {
          targetProp.damageTriggerIds ??= {};
          (targetProp.damageTriggerIds[prop.timing] ??= []).push(prop._id);
        }
        break;
      case 'check':
        // Only apply to attributes and skills
        if (targetProp.type === 'attribute' || targetProp.type === 'skill') {
          targetProp.checkTriggerIds ??= {};
          (targetProp.checkTriggerIds[prop.timing] ??= []).push(prop._id);
        }
        break;
    }
  }
}
