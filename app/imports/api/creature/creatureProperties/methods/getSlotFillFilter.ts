import type { CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';
import type { LibraryNode } from '/imports/api/library/LibraryNodes';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default function getSlotFillFilter({ slot, libraryIds }: {
  slot: CreaturePropertyTypes['propertySlot'] | CreaturePropertyTypes['class'],
  libraryIds: string[],
}): Mongo.Selector<LibraryNode> {

  if (!slot) throw new Meteor.Error('defect', 'Slot is required for getSlotFillFilter');
  if (!libraryIds) throw new Meteor.Error('defect', 'LibraryIds is required for getSlotFillFilter');

  const filter: Mongo.Selector<LibraryNode> = {
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
  if ('slotType' in slot && slot.slotType) {
    filter.$and?.push({
      $or: [{
        type: slot.slotType as never
      }, {
        slotFillerType: slot.slotType,
      }]
    });
  } else if (slot.type === 'class') {
    const classLevelFilter: Mongo.Selector<LibraryNode> = {
      type: 'classLevel',
    };
    const slotFillerFilter: Mongo.Selector<LibraryNode> = {
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

    filter.$and?.push({
      $or: [classLevelFilter, slotFillerFilter]
    });
  }
  const tagsOr: Mongo.Selector<LibraryNode>[] = [];
  const tagsNin: string[] = [];
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
    filter.$and?.push({ libraryTags: { $nin: tagsNin } });
  }
  if (!filter.$and?.length) {
    delete filter.$and;
  }
  return filter;
}
