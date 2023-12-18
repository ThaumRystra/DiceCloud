import computeCreature from '/imports/api/engine/computeCreature';

/**
 * Recomputes all ancestor creatures of this property
 * @deprecated
 */
export default function recomputeCreaturesByProperty(property) {
  computeCreature.call(property.root.id);
}
