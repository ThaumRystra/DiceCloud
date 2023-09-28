import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

export default function cleanProp(prop) {
  if (!prop.root) {
    prop.root = { collection: 'creatures', id: 'testCreature' }
  }
  let schema = CreatureProperties.simpleSchema(prop);
  return schema.clean(prop);
}
