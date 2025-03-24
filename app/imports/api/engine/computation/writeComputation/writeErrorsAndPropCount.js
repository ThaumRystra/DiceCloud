import Creatures from '/imports/api/creature/creatures/Creatures';
import VERSION from '/imports/constants/VERSION';

export default function writeErrorsAndPropCount(creatureId, errors = [], propCount) {
  if (errors.length) {
    Creatures.update(creatureId, {
      $set: {
        computeErrors: errors,
        propCount,
        lastComputedAt: new Date(),
        computeVersion: VERSION,
      }
    });
  } else {
    Creatures.update(creatureId, {
      $set: {
        propCount,
        lastComputedAt: new Date(),
        computeVersion: VERSION,
      }, $unset: { computeErrors: 1 }
    });
  }
}
