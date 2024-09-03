export default function migrateProperty2To3(prop) {
  prop.root = prop.ancestors[0];
  if (!prop.root) {
    throw 'Property has no root ancestor, will become orphaned'
  }
  if (prop.parent?.collection === 'creatureProperties') {
    prop.parentId = prop.parent.id;
  }
  prop.left = prop.order;
  prop.right = prop.order;
}