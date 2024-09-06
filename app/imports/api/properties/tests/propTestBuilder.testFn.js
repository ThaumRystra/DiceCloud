import { applyNestedSetProperties } from '/imports/api/parenting/parentingFunctions';

/**
 * Take a forest of props, which can have sub-props nested in children: [], and return a list of
 * clean props with correct tree and ancestry data
 * @param props 
 * @returns 
 */
export function propsFromForest(
  props,
  creatureId = Random.id(),
  parentId = undefined,
  recursionDepth = 0
) {
  const result = [];
  props.forEach(prop => {
    const children = prop.children;
    // Check the property has a type
    if (!prop.type) {
      throw new Error('Type is required on every property, not found on doc: ' + JSON.stringify(prop, null, 2));
    }
    // Create the clean doc
    const doc = {
      ...prop,
      left: result.length,
      root: { id: creatureId, collection: 'creatures' },
    };
    if (parentId) {
      doc.parentId = parentId;
    }
    if (!doc._id) {
      doc._id = Random.id();
    }
    delete doc.children;

    // Add the doc to the result and ancestry
    result.push(doc);
    if (children) {
      result.push(...propsFromForest(children, creatureId, doc._id, recursionDepth + 1));
    }
  });

  // Apply the nested set properties on the top level
  if (recursionDepth === 0) {
    applyNestedSetProperties(result);
  }
  return result;
}
