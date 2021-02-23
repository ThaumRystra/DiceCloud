import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
// n + 1 database queries + n potential updates for n slots. Could be sped up.
export default function recomputeSlotFullness(ancestorId){
  CreatureProperties.find({
    'ancestors.id': ancestorId,
    type: 'propertySlot',
  }).forEach(slot => {
    let children = CreatureProperties.find({
      'parent.id': slot._id,
      removed: {$ne: true},
    }, {
      fields: {
        slotQuantityFilled: 1,
        type: 1
      }
    }).fetch();
    let totalFilled = 0;
    children.forEach(child => {
      if (child.type === 'slotFiller'){
        totalFilled += child.slotQuantityFilled;
      } else {
        totalFilled++;
      }
    });
    let spaceLeft;
    let expected = slot.quantityExpectedResult;
    if (typeof expected !== 'number'){
      expected = 1;
    }
    if (expected === 0){
      spaceLeft = null;
    } else {
      spaceLeft = expected - totalFilled;
    }
    if (slot.totalFilled !== totalFilled || slot.spaceLeft !== spaceLeft){
      CreatureProperties.update(slot._id, {
        $set: {totalFilled, spaceLeft},
      }, {
        selector: {type: 'propertySlot'}
      });
    }
  });
}
