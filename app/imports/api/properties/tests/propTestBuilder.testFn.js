/**
 * Take a forest of props, which can have sub-props nested in children: [], and return a list of
 * clean props with correct tree and ancestry data
 * @param props 
 * @returns 
 */
export function propsFromForest(
  props,
  ancestry = [{ id: 'creatureId', collection: 'creatures' }],
) {
  const result = [];
  props.forEach(prop => {
    const children = prop.children;
    // Check the property has a type
    if (!prop.type) {
      console.log(prop);
      throw 'Type is required on every property, not found on above doc';
    }
    // Create the clean doc
    const doc = { ...prop };
    if (!doc._id) {
      doc._id = Random.id();
    }
    delete doc.children;
    doc.order = result.length;
    doc.parent = { ...ancestry[ancestry.length - 1] };
    doc.ancestors = [...ancestry];

    // Add the doc to the result and ancestry
    result.push(doc);
    if (children) {
      ancestry.push({ id: doc._id, collection: 'creatureProperties' });
      // Add the children to the result
      result.push(...propsFromForest(children, ancestry));
      // Remove the doc from the ancestry after its children are done
      ancestry.pop();
    }
  });
  return result;
}
