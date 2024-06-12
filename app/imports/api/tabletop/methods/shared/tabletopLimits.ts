const MAX_PROP_COUNT = 10_000;
const MAX_CREATURE_COUNT = 110;

export function assertTabletopHasPropSpace(tabletop) {
  if (tabletop.propCount >= MAX_PROP_COUNT) {
    throw new Meteor.Error('tabletops.denied',
      'This tabletop is full, either remove some creatures or reduce how many properties each creature has');
  }
  if (tabletop.creatureCount >= MAX_CREATURE_COUNT) {
    throw new Meteor.Error('tabletops.denied',
      'This tabletop is full, you can\'t add any more creatures to it');
  }
}
