import { getPropertyName } from '/imports/constants/PROPERTIES.js';

export default function getPropertyTitle(prop){
  if (prop.name) return prop.name;
  return getPropertyName(prop.type);
}
