export default function getSlotFillFilter({slot, libraryIds}){
  let filter = {
    removed: {$ne: true},
    $and: []
  };
  if (libraryIds){
    filter['ancestors.id'] = {$in: libraryIds};
  }
  if (slot.slotType){
    filter.$and.push({
      $or: [{
        type: slot.slotType
      },{
        type: 'slotFiller',
        slotFillerType: slot.slotType,
      }]
    });
  }
  let tagsOr = [];
  let tagsNor = [];
  if (slot.slotTags && slot.slotTags.length){
    tagsOr.push({tags: {$all: slot.slotTags}});
  }
  if (slot.extraTags && slot.extraTags.length){
    slot.extraTags.forEach(extra => {
      if (!extra.tags || !extra.tags.length) return;
      if (extra.operation === 'OR'){
        tagsOr.push({tags: {$all: extra.tags}});
      } else if (extra.operation === 'NOT'){
        tagsNor.push({tags: {$all: extra.tags}});
      }
    });
  }
  if (tagsOr.length){
    filter.$and.push({$or: tagsOr});
  }
  if (tagsNor.length){
    filter.$and.push({$nor: tagsNor});
  }
  if (!filter.$and.length){
    delete filter.$and;
  }
  return filter;
}
