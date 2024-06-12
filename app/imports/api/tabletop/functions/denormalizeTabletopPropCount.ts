import { debounce } from 'lodash';
import Creatures from '/imports/api/creature/creatures/Creatures';
import Tabletops from '/imports/api/tabletop/Tabletops';

// Store a function per tabletop to debounce the update
const queues: Record<string, () => void> = {};
/**
 * Update the propCount field on a tabletop to reflect the sum of all propCounts of creatures in
 * that tabletop.
 * Debounced by 1s, per tabletop
 */
export default function updateTabletopPropCount(tabletopId: string) {
  if (!tabletopId) return;

  // Server only
  if (Meteor.isClient) return;

  // If there isn't a debounced function for this tabletop, create one
  if (!queues[tabletopId]) {
    queues[tabletopId] = debounce(() => {
      doUpdateTabletopPropCount(tabletopId);
      // When this function is actually run, delete the debounced function
      delete queues[tabletopId];
    }, 1_000);
  }

  // Call the debounced function for this tabletop
  queues[tabletopId]();
}

/**
 * Update the propCount field on a tabletop to reflect the sum of all propCounts of creatures in
 * that tabletop
 */
async function doUpdateTabletopPropCount(tabletopId: string) {
  let propCount = 0;
  let creatureCount = 0;
  await Creatures.find({
    tabletopId
  }, {
    fields: { propCount: 1 }
  }).forEachAsync(creature => {
    creatureCount += 1;
    propCount += creature.propCount || 0;
  });
  return Tabletops.update(tabletopId, {
    $set: {
      propCount,
      creatureCount,
    }
  });
}
