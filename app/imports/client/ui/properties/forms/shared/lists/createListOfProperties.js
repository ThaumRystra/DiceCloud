import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';

export default function createListOfProperties(filter = {}, getNamesWithValues) {
  filter.removed = { $ne: true };
  let propertyList = [];
  let variableNames = new Set();
  function addUniquePropertys(property) {
    if (property.variableName && !variableNames.has(property.variableName)) {
      variableNames.add(property.variableName);
      propertyList.push({
        text: property.name || property.variableName,
        value: property.variableName,
        propertyType: property.propertyType,
      });
    }
  }
  let options = { sort: { order: 1, variableName: 1 } }
  CreatureProperties.find(filter, options).forEach(addUniquePropertys);
  LibraryNodes.find(filter, options).forEach(addUniquePropertys);
  if (getNamesWithValues) return propertyList;
  return Array.from(variableNames);
}
