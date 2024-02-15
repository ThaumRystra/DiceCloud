import { getPropertyName } from '/imports/constants/PROPERTIES';

export default function getPropertyTitle(prop) {
  if (prop.name) return prop.name;
  return getPropertyName(prop.type);
}
