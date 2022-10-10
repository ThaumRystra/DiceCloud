export default function getEffectivePropTags(prop) {
  if (!prop.tags) return [];
  const tags = [...prop.tags];
  // Tags for the property type, separate #damage from #healing
  if (prop.type === 'damage' && prop.damageType === 'healing') {
    tags.push('#healing');
  } else {
    tags.push(`#${prop.type}`);
  }

  // Tags for some string properties
  if (prop.variableName) tags.push(prop.variableName);
  if (prop.damageType) tags.push(prop.damageType);
  if (prop.skillType) tags.push(prop.skillType);
  if (prop.actionType) tags.push(prop.actionType);
  if (prop.attributeType) tags.push(prop.attributeType);
  if (prop.reset) tags.push(prop.reset);
  return tags;
}
