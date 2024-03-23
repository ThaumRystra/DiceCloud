export default function migrate2To3(archive) {
  archive.properties = archive.properties.map(prop => {
    try {
      prop.root = prop.ancestors[0];
      if (!prop.root) {
        throw 'Property has no root ancestor, will become orphaned'
      }
      if (prop.parent?.collection === 'creatureProperties') {
        prop.parentId = prop.parent.id;
      }
      prop.left = prop.order;
      prop.right = prop.order;
    } catch (e) {
      console.warn('Property migration 2 -> 3 failed: ', { propId: prop._id, error: e.message || e.reason || e.toString() });
    }
    return prop;
  });
}
