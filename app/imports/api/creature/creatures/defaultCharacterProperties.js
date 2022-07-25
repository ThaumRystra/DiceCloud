import BUILT_IN_TAGS from '/imports/constants/BUILT_IN_TAGS.js';

export default function defaultCharacterProperties(creatureId){
  if (!creatureId) throw 'creatureId is required';
  const creatureRef = {collection: 'creatures', id: creatureId};
  let randomSrc = DDP.randomStream('defaultProperties');
  const inventoryId = randomSrc.id();
  const inventoryRef = {collection: 'creatureProperties', id: inventoryId};
  return [
    {
      type: 'propertySlot',
      name: 'Ruleset',
      description: {text: 'Choose a starting point for your character, this will define the basic setup of your character sheet. Without a base ruleset, your sheet will be empty.'},
      slotTags: ['base'],
      tags: [],
      quantityExpected: {calculation: '1'},
      hideWhenFull: true,
      spaceLeft: 1,
      totalFilled: 0,
      order: 0,
      parent: creatureRef,
      ancestors: [creatureRef],
    }, {
      _id: inventoryId,
      type: 'folder',
      name: 'Inventory',
      tags: [BUILT_IN_TAGS.inventory],
      order: 1,
      parent: creatureRef,
      ancestors: [creatureRef],
    }, {
      type: 'folder',
      name: 'Equipment',
      tags: [BUILT_IN_TAGS.equipment],
      order: 2,
      parent: inventoryRef,
      ancestors: [creatureRef, inventoryRef],
    }, {
      type: 'folder',
      name: 'Carried',
      tags: [BUILT_IN_TAGS.carried],
      order: 3,
      parent: inventoryRef,
      ancestors: [creatureRef, inventoryRef],
    },
  ];
}
