import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';

export default function createAction({
  creature = {_id: 'creatureId'},
  targets = [],
  properties = [],
  ancestors = [],
  method
} = {}){
  properties = properties.map(cleanProp);
  ancestors = ancestors.map(cleanProp);
  creature = cleanCreature(creature);
  ancestors = ancestors.map(cleanCreature);
  return {creature, targets, properties, ancestors, method};
}

function cleanProp(prop){
  let schema = CreatureProperties.simpleSchema(prop);
  return schema.clean(prop);
}

function cleanCreature(creature){
  let schema = Creatures.simpleSchema(creature);
  return schema.clean(creature);
}
