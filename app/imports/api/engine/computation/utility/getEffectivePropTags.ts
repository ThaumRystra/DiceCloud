import type { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';

export default function getEffectivePropTags(prop: CreatureProperty) {
  if (!prop.tags) return [];
  const tags = [...prop.tags];
  // Tags for the property type, separate #damage from #healing
  if (prop.type === 'damage' && prop.damageType === 'healing') {
    tags.push('#healing');
  } else {
    tags.push(`#${prop.type}`);
  }

  // Tags for some string properties
  if ('variableName' in prop && prop.variableName) tags.push(prop.variableName);
  if ('damageType' in prop && prop.damageType) tags.push(prop.damageType);
  if ('skillType' in prop && prop.skillType) tags.push(prop.skillType);
  if ('actionType' in prop && prop.actionType) tags.push(prop.actionType);
  if ('attributeType' in prop && prop.attributeType) tags.push(prop.attributeType);
  if ('reset' in prop && prop.reset) tags.push(prop.reset);
  return tags;
}
