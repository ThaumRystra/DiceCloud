import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default function getSlotFillFilter({ slot, libraryIds }) {

  if (!slot) throw 'Slot is required for getSlotFillFilter';
  if (!libraryIds) throw 'LibraryIds is required for getSlotFillFilter';

  let filter = {
    fillSlots: true,
    removed: { $ne: true },
    $and: [],
  };
  if (libraryIds.length) {
    Object.assign(
      filter,
      getFilter.descendantsOfAllRoots(libraryIds)
    );
  }
  if (slot.slotType) {
    filter.$and.push({
      $or: [{
        type: slot.slotType
      }, {
        slotFillerType: slot.slotType,
      }]
    });
  } else if (slot.type === 'class') {
    const classLevelFilter = {
      type: 'classLevel',
    };
    const slotFillerFilter = {
      slotFillerType: 'classLevel',
    };

    // Match variable name or tags
    if (slot.variableName) {
      classLevelFilter.variableName = slot.variableName;
      slotFillerFilter.libraryTags = slot.variableName;
    }

    // Only search for levels the class needs
    if (slot.missingLevels && slot.missingLevels.length) {
      classLevelFilter.level = { $in: slot.missingLevels };
      slotFillerFilter['cache.node.level'] = { $in: slot.missingLevels };
    } else {
      classLevelFilter.level = { $gt: slot.level || 0 };
      slotFillerFilter['cache.node.level'] = { $gt: slot.level || 0 };
    }

    filter.$and.push({
      $or: [classLevelFilter, slotFillerFilter]
    });
  }
  let tagsOr = [];
  let tagsNin = [];
  if (slot.slotTags && slot.slotTags.length) {
    tagsOr.push({ libraryTags: { $all: slot.slotTags } });
  }
  if (slot.extraTags && slot.extraTags.length) {
    slot.extraTags.forEach(extra => {
      if (!extra.tags || !extra.tags.length) return;
      if (extra.operation === 'OR') {
        tagsOr.push({ libraryTags: { $all: extra.tags } });
      } else if (extra.operation === 'NOT') {
        tagsNin.push(...extra.tags);
      }
    });
  }
  if (tagsOr.length) {
    filter.$or = tagsOr;
  }
  if (tagsNin.length) {
    filter.$and.push({ libraryTags: { $nin: tagsNin } });
  }
  if (!filter.$and.length) {
    delete filter.$and;
  }
  return filter;
}
