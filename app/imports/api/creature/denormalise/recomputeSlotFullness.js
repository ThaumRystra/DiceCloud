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
    }).fetch();
    let totalFilled = 0;
    children.forEach(child => {
      if (child.type === 'slotFiller'){
        totalFilled += child.slotQuantityFilled;
      } else {
        totalFilled++;
      }
    });
    if (slot.totalFilled !== totalFilled){
      CreatureProperties.update(slot._id, {
        $set: {totalFilled},
      }, {
        selector: {type: 'propertySlot'}
      });
    }
  });
}
