import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

export default function cleanProp(prop) {
  let schema = CreatureProperties.simpleSchema(prop);
  return schema.clean(prop);
}
