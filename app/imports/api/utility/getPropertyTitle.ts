import type { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import type { LibraryNode } from '/imports/api/library/LibraryNodes';
import { getPropertyName } from '/imports/constants/PROPERTIES';

export default function getPropertyTitle(prop: CreatureProperty | LibraryNode) {
  if ('name' in prop && prop.name) return prop.name;
  return getPropertyName(prop.type);
}
