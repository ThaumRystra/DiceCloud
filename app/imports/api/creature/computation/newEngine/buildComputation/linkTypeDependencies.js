const linkDependenciesByType = {
  attribute: linkVariableName,
  classLevel: linkVariableName,
  constant: linkVariableName,
  damageMultiplier: linkDamageMultiplier,
  proficiency: linkStats,
  effect: linkStats,
  skill: linkSkill,
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

function linkDamageMultiplier(dependencyGraph, prop){
  prop.damageTypes.forEach(damageType => {
    dependencyGraph.addLink(`${damageType}Multiplier`, prop._id, 'damageMultiplier');
  });
}

function linkStats(dependencyGraph, prop){
  // The stats a prop references depend on that prop
  prop.stats.forEach(variableName => {
    if (!variableName) return;
    dependencyGraph.addLink(variableName, prop._id, 'statChange');
  });
}

function linkSkill(dependencyGraph, prop){
  linkVariableName(dependencyGraph, prop);
  // The prop depends on the variable references as the ability
  if (prop.ability) dependencyGraph.addLink(prop._id, prop.ability, 'skillAbilityScore');
}
