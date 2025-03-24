import { SetRequired } from 'type-fest';
import CreatureProperties, { CreatureProperty, CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';
import { cleanAndValidate } from '/imports/api/utility/TypedSimpleSchema';

export default function cleanProp<T extends SetRequired<Partial<CreatureProperty>, 'type'>>(prop: T): CreaturePropertyTypes[T['type']] {
  if (!prop.root) {
    prop.root = { collection: 'creatures', id: 'testCreature' }
  }
  const schema = CreatureProperties.simpleSchema(prop);
  return cleanAndValidate(schema, prop as Partial<CreatureProperty>) as CreaturePropertyTypes[T['type']];
}
