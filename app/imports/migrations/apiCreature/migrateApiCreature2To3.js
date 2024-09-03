import migrateProperty2To3 from '/imports/migrations/archive/properties/migrateProperty2To3';

export default function migrateApiCreature2To3(creature) {
  creature.creatureProperties = creature.creatureProperties.map(prop => {
    try {
      migrateProperty2To3(prop);
    } catch (e) {
      console.warn('Property migration 2 -> 3 failed: ', { propId: prop._id, error: e.message || e.reason || e.toString() });
    }
    return prop;
  });
}
