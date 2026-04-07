import Libraries from '/imports/api/library/Libraries';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import addCreaturesFromLibraryToTabletop from '/imports/api/tabletop/methods/addCreaturesFromLibraryToTabletop';
import Tabletops from '/imports/api/tabletop/Tabletops';
import { assert } from 'chai';

describe('addCreaturesFromLibraryToTabletop', function () {
  const libraryCreatureId = Random.id();
  const tabletopId = Random.id();
  this.beforeAll(function () {
    const libraryId = Libraries.insert({
      name: 'Some library',
      owner: 'aaa'
    });
    LibraryNodes.insert({
      _id: libraryCreatureId,
      type: 'creature',
      tags: [],
      root: {
        collection: 'libraries',
        id: libraryId,
      },
      left: 0,
      right: 1,
      name: 'Library Bear',
    });
    Tabletops.insert({
      _id: tabletopId,
      owner: 'aaa',
      name: 'Some Tabletop',
      gameMasters: [],
      spectators: [],
      players: [],
      initiative: {
        active: false,
        roundNumber: 0,
      },
      propCount: 0,
    });
  });
  it('adds creatures', async function () {
    await Meteor.bindEnvironment(async () => {
      const creature = await addCreaturesFromLibraryToTabletop.callAsync({
        libraryNodeIds: [libraryCreatureId], tabletopId
      });
      assert.exists(creature);
    });
  });
});
