import type { OptionalId } from 'mongodb';
import type { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import BUILT_IN_TAGS from '/imports/constants/BUILT_IN_TAGS';

export default function defaultCharacterProperties(creatureId: string): OptionalId<CreatureProperty>[] {
  if (!creatureId) throw new Meteor.Error('invalid-argument', 'creatureId is required');
  const creatureRef = { collection: 'creatures' as const, id: creatureId };
  const randomSrc = DDP.randomStream('defaultProperties');
  const inventoryId = randomSrc.id();
  return [
    {
      type: 'propertySlot',
      name: 'Ruleset',
      description: { text: 'Choose a starting point for your character, this will define the basic setup of your character sheet. Without a base ruleset, your sheet will be empty.' },
      slotTags: ['base'],
      tags: [],
      quantityExpected: { calculation: '1' },
      hideWhenFull: true,
      spaceLeft: 1,
      totalFilled: 0,
      left: 1,
      right: 2,
      parentId: creatureId,
      root: creatureRef,
      extraTags: [],
    }, {
      _id: inventoryId,
      type: 'folder',
      name: 'Inventory',
      tags: [BUILT_IN_TAGS.inventory],
      left: 3,
      right: 8,
      parentId: creatureId,
      root: creatureRef,
    }, {
      type: 'folder',
      name: 'Equipment',
      tags: [BUILT_IN_TAGS.equipment],
      left: 4,
      right: 5,
      parentId: inventoryId,
      root: creatureRef,
    }, {
      type: 'folder',
      name: 'Carried',
      tags: [BUILT_IN_TAGS.carried],
      left: 6,
      right: 7,
      parentId: inventoryId,
      root: creatureRef,
    },
  ];
}
