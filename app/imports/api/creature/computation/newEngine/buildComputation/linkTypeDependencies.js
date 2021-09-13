const linkDependenciesByType = {
  action: linkResources,
  attack: linkResources,
  attribute: linkAttribute,
  classLevel: linkVariableName,
  constant: linkVariableName,
  damageMultiplier: linkDamageMultiplier,
  proficiency: linkStats,
  effect: linkStats,
  skill: linkSkill,
  spell: linkResources,
}

export default function linkTypeDependencies(dependencyGraph, prop){
  linkDependenciesByType[prop.type]?.(prop);
}

function linkVariableName(dependencyGraph, prop){
  // The variableName of the prop depends on the prop
  if (prop.variableName){
    dependencyGraph.addLink(prop.variableName, prop._id, 'definition');
  }
}

function linkResources(dependencyGraph, prop, {propsById}){
  prop.resources.itemsConsumed.forEach(itemConsumed => {
    if (!itemConsumed.itemId) return;
    const item = propsById[itemConsumed.itemId];
    if (!item.equipped) {
      itemConsumed.itemId = undefined;
      return;
    }
    if (!item) return;
    // none of these dependencies are computed, we can use them immediately
    prop.available = item.quantity;
    prop.itemName = item.name;
    prop.itemIcon = item.icon;
    prop.itemColor = item.color;
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
    dependencyGraph.addLink(`${damageType}Multiplier`, prop._id, prop.type);
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
