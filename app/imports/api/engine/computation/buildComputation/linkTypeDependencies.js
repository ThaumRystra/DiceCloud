const linkDependenciesByType = {
  action: linkResources,
  attribute: linkAttribute,
  class: linkVariableName,
  classLevel: linkClassLevel,
  constant: linkVariableName,
  damageMultiplier: linkDamageMultiplier,
  proficiency: linkStats,
  effect: linkStats,
  skill: linkSkill,
  spell: linkResources,
  toggle: linkVariableName,
}

export default function linkTypeDependencies(dependencyGraph, prop, computation){
  linkDependenciesByType[prop.type]?.(dependencyGraph, prop, computation);
}

function linkClassLevel(dependencyGraph, prop){
  // The variableName of the prop depends on the prop
  if (prop.variableName && prop.level){
    dependencyGraph.addLink(prop.variableName, prop._id, 'classLevel');
    // The level variable depends on the class variableName variable
    let existingLevelLink = dependencyGraph.getLink('level', prop.variableName);
    if (!existingLevelLink){
      dependencyGraph.addLink('level', prop.variableName, 'level');
    }
  }
}

function linkVariableName(dependencyGraph, prop){
  // The variableName of the prop depends on the prop
  if (prop.variableName){
    dependencyGraph.addLink(prop.variableName, prop._id, 'definition');
  }
}

function linkResources(dependencyGraph, prop, {propsById}){
  if (!prop.resources) return;
  prop.resources.itemsConsumed.forEach(itemConsumed => {
    if (!itemConsumed.itemId) return;
    const item = propsById[itemConsumed.itemId];
    if (!item || item.inactive){
      // Unlink if the item doesn't exist or is inactive
      itemConsumed.itemId = undefined;
      return;
    }
    // none of these dependencies are computed, we can use them immediately
    itemConsumed.available = item.quantity;
    itemConsumed.itemName = item.name;
    itemConsumed.itemIcon = item.icon;
    itemConsumed.itemColor = item.color;
    dependencyGraph.addLink(prop._id, item._id, 'inventory');
  });
  prop.resources.attributesConsumed.forEach(attConsumed => {
    if (!attConsumed.variableName) return;
    dependencyGraph.addLink(prop._id, attConsumed.variableName, 'resource');
  });
}

function linkAttribute(dependencyGraph, prop){
  linkVariableName(dependencyGraph, prop);
  // hit dice depend on constitution
  if (prop.attributeType === 'hitDice'){
    dependencyGraph.addLink(prop._id, 'constitution', 'hitDiceConMod');
  }
}

function linkDamageMultiplier(dependencyGraph, prop){
  prop.damageTypes.forEach(damageType => {
    // Remove all non-letter characters from the damage name
    const damageName = damageType.replace(/[^a-z]/gi, '')
    dependencyGraph.addLink(`${damageName}Multiplier`, prop._id, prop.type);
  });
}

function linkStats(dependencyGraph, prop){
  // The stats a prop references depend on that prop
  prop.stats.forEach(variableName => {
    if (!variableName) return;
    dependencyGraph.addLink(variableName, prop._id, prop.type);
  });
}

function linkSkill(dependencyGraph, prop){
  linkVariableName(dependencyGraph, prop);
  // The prop depends on the variable references as the ability
  if (prop.ability){
    dependencyGraph.addLink(prop._id, prop.ability, 'skillAbilityScore');
  }
  // Skills depend on the creature's proficiencyBonus
  dependencyGraph.addLink(prop._id, 'proficiencyBonus', 'skillProficiencyBonus');
}
