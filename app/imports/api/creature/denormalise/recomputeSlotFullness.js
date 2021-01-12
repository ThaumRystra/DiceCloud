import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
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
      console.log(child);
      if (child.type === 'slotFiller'){
        totalFilled += child.slotQuantityFilled;
      } else {
        totalFilled++;
      }
    });
    let spaceLeft;
    if (slot.quantityExpected === 0){
      spaceLeft = null;
    } else {
      spaceLeft = slot.quantityExpected - totalFilled;
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
