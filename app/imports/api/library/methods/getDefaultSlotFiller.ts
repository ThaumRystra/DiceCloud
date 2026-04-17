import type { CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';

export default function getDefaultSlotFiller(slot: CreaturePropertyTypes['propertySlot']) {
  let slotType = slot.slotType;
  if (!slotType || slot.slotType === 'slotFiller') {
    slotType = 'folder';
  }

  const filler = {
    type: slotType,
    libraryTags: slot.slotTags || [],
    name: 'Custom ' + slot.name || 'slot filler',
    parentId: slot._id,
    root: { ...slot.root },
  };
  return filler;
}
