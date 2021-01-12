export default function getClosestPropertyAncestorCreatureId(prop){
  if (!prop.ancestors) throw 'Property has no ancestors';
  let creatureId;
  // Find the last ancestor in the creature collection
  for (let i = prop.ancestors.length - 1; i >= 0; i--){
    if (prop.ancestors[i].collection === 'creatures'){
      creatureId = prop.ancestors[i].id;
      break;
    }
  }
  if (!creatureId) throw 'This property has no creature ancestors';
  return creatureId;
}
