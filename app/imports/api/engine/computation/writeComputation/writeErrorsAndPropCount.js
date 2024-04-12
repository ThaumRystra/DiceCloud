import Creatures from '/imports/api/creature/creatures/Creatures';

export default function writeErrorsAndPropCount(creatureId, errors = [], propCount) {
  if (errors.length) {
    Creatures.update(creatureId, { $set: { computeErrors: errors, propCount } });
  } else {
    Creatures.update(creatureId, { $set: { propCount }, $unset: { computeErrors: 1 } });
  }
}
