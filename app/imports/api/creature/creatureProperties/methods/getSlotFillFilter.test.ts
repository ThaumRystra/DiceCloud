import { assert } from 'chai';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter';
import type { LibraryNode } from '/imports/api/library/LibraryNodes';

describe('Slot fill filter', function () {

  it('Gives error if arguments aren\'t provided', function () {
    assert.throws(
      () => getSlotFillFilter(undefined as never),
      null, null, 'Passing undefined should give an error'
    );
    assert.throws(
      () => getSlotFillFilter({
        slot: { slotTags: ['tag1'] },
      } as never),
      null, null, 'Passing no libraryIds should give an error'
    );
    assert.throws(
      () => getSlotFillFilter({
        libraryIds: ['libraryId1'],
      } as never),
      null, null, 'Passing no slot should give an error'
    );
  });

  it('filters using basic slot tags', function () {
    const filter = getSlotFillFilter({
      slot: {
        slotTags: ['tag1', 'tag2']
      } as never,
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
    const filter: Mongo.Query<LibraryNode> = getSlotFillFilter({
      slot: {
        slotTags: ['tag1', 'tag2'],
        slotType: 'feature',
      } as never,
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
          { _id: '1', operation: 'OR', tags: ['tag3', 'tag4'] },
          { _id: '2', operation: 'NOT', tags: ['tag5', 'tag6'] },
          { _id: '3', operation: 'NOT', tags: ['tag7', 'tag8'] },
        ],
      } as never,
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
