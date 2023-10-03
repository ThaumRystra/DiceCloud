import { assert } from 'chai';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter';

describe('Slot fill filter', function () {

  it('Gives error if arguments aren\'t provided', function () {
    assert.throws(
      () => getSlotFillFilter(undefined),
      null, null, 'Passing undefined should give an error'
    );
    assert.throws(
      () => getSlotFillFilter({
        slot: { slotTags: ['tag1'] },
      }),
      null, null, 'Passing no libraryIds should give an error'
    );
    assert.throws(
      () => getSlotFillFilter({
        libraryIds: ['libraryId1'],
      }),
      null, null, 'Passing no slot should give an error'
    );
  });

  it('filters using basic slot tags', function () {
    const filter = getSlotFillFilter({
      slot: {
        slotTags: ['tag1', 'tag2']
      },
      libraryIds: ['libraryId1', 'libraryId2'],
    });
    assert.deepStrictEqual(filter, {
      $or: [{
        libraryTags: { $all: ['tag1', 'tag2'] }
      }],
      'root.id': { $in: ['libraryId1', 'libraryId2'] },
      removed: { $ne: true },
      fillSlots: true,
    });
  });

  it('filters using slot type', function () {
    const filter = getSlotFillFilter({
      slot: {
        slotTags: ['tag1', 'tag2'],
        slotType: 'feature',
      },
      libraryIds: ['libraryId1', 'libraryId2']
    });
    assert.deepStrictEqual(filter.$and, [{
      $or: [{
        type: 'feature'
      }, {
        slotFillerType: 'feature',
      }],
    }]);
  });

  it('filters using extra tags', function () {
    const filter = getSlotFillFilter({
      slot: {
        slotTags: ['tag1', 'tag2'],
        extraTags: [
          { operation: 'OR', tags: ['tag3', 'tag4'] },
          { operation: 'NOT', tags: ['tag5', 'tag6'] },
          { operation: 'NOT', tags: ['tag7', 'tag8'] },
        ],
      },
      libraryIds: ['libraryId1', 'libraryId2'],
    });
    assert.deepStrictEqual(filter, {
      $or: [
        { libraryTags: { $all: ['tag1', 'tag2'] } },
        { libraryTags: { $all: ['tag3', 'tag4'] } },
      ],
      $and: [
        { libraryTags: { $nin: ['tag5', 'tag6', 'tag7', 'tag8'] } },
      ],
      'root.id': { $in: ['libraryId1', 'libraryId2'] },
      removed: { $ne: true },
      fillSlots: true,
    });
  });

});