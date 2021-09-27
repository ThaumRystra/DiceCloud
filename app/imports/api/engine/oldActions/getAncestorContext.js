import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';

export default function getAncestorContext(prop){
  // Build ancestor context
  const actionContext = {};
  let ancestorIds = prop.ancestors.map(ref => ref.id);
  CreatureProperties.find({
    _id: {$in: ancestorIds}
  }, {
    sort: {order: 1},
  }).forEach(ancestor => {
    actionContext[`#${ancestor.type}`] = ancestor;
  });
  return actionContext;
}
