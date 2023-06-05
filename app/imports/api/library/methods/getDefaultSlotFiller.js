export default function getDefaultSlotFiller(slot) {
  if (typeof slot !== 'object') throw 'getDefaultSlotFiller requires a slot';
  if (slot.type !== 'propertySlot') throw 'provided slot must be a propertySlot';

  const filler = {
    type: slot.slotType || 'folder',
    libraryTags: slot.slotTags || [],
    name: 'Custom ' + slot.name || 'slot filler',
    parent: { collection: 'creatureProperties', id: slot._id },
    ancestors: [...slot.ancestors, { collection: 'creatureProperties', id: slot._id }],
  };
  return filler;
}
