import { migratePropUp, migratePropDown } from './dbv2';
import { assert } from 'chai';

const exampleAttack = {
  '_id': 'vw23EnJwBRcXEJg7i',
  'actionType': 'attack',
  'target': 'singleTarget',
  'tags': ['attack', 'magical', 'very cool'],
  'resources': {
    'itemsConsumed': [],
    'attributesConsumed': []
  },
  'attackRoll': {
    calculation: 'dexterity.modifier + proficiency$Bonus + 2 - hp.total + hp.value + $dollarSign',
    hash: 1234567,
  },
  'summary': {
    text: 'What if we {$had} two {$dollarSigns?} ',
    hash: 123456,
  },
  'type': 'action',
  'name': 'Claws',
  'parent': {
    'id': 'Jpx8q3WjM5SCoGBm8',
    'collection': 'creatureProperties'
  },
  'ancestors': [{
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv'
  }, {
    'id': '3WS2xsSPAqB4eF9YH',
    'collection': 'creatureProperties'
  }, {
    'id': 'rhYLEycvtHjcioaQL',
    'collection': 'creatureProperties'
  }, {
    'id': 'Jpx8q3WjM5SCoGBm8',
    'collection': 'creatureProperties'
  }],
  'order': 56,
  'usesUsed': 2,
};

const expectedAttackUpdate = {
  $set: {
    'attackRoll.calculation': 'dexterity.modifier + proficiency$Bonus + 2 - hp.total + hp.value + ~dollarSign',
    'libraryTags': ['attack', 'magical', 'very cool'],
    'fillSlots': true,
    'searchable': true,
    'summary.text': 'What if we {~had} two {~dollarSigns?} ',
  },
  $unset: {
    'attackRoll.hash': 1,
    'summary.hash': 1,
  },
};

const emptyFolderExample = {
  _id: 'DXPYsHKF6W8Hh3hZs',
  type: 'folder',
  name: 'Empty Folder',
  'parent': {
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv',
  },
  'ancestors': [{
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv',
  }],
};

const exampleSlotFiller = {
  _id: 'DXPYsHKF6888h3hZs',
  type: 'slotFiller',
  name: 'Slot Filler Example',
  'picture': 'https://url.to.pic',
  'tags': ['slot', 'tags'],
  'parent': {
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv',
  },
  'ancestors': [{
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv',
  }],
};
const expectedSlotFillerUpdate = {
  $set: {
    'libraryTags': ['slot', 'tags'],
    'fillSlots': true,
    'searchable': true,
    'slotFillImage': 'https://url.to.pic',
    'type': 'folder'
  },
  $unset: {
    picture: 1,
  },
};

const DownMergeExample = {
  _id: 'DXPYsHKF6W8Hh3hZs',
  type: 'feature',
  name: 'Feature With Tags and library Tags',
  'parent': {
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv',
  },
  'ancestors': [{
    'collection': 'creatures',
    'id': 'm9sdCvs6iDf7qRaGv',
  }],
  'libraryTags': ['tags', 'from', 'library'],
  'tags': ['attack', 'magical', 'very cool'],
};

const expectedDownMergeUpdate = {
  $unset: {
    slotFillImage: 1,
    slotFillerCondition: 1,
    libraryTags: 1,
    fillSlots: 1,
    searchable: 1,
  },
  $set: {
    tags: ['tags', 'from', 'library', 'attack', 'magical', 'very cool'],
  }
};

describe('dbv2 Migrate library nodes', function () {
  return;
  it('Migrates attacks up', function () {
    const collection = stubCollection();
    migratePropUp(exampleAttack, collection);
    const { query, update } = collection.result();
    assert.deepEqual(query, { _id: 'vw23EnJwBRcXEJg7i' }, 'The query should match the id of the given prop');
    assert.deepEqual(update, expectedAttackUpdate, 'The update should match the expected update');
  });
  it('Migrates props without tags up', function () {
    const collection = stubCollection();
    migratePropUp(emptyFolderExample, collection);
    const { query, update, timesFind, timesUpdate } = collection.result();
    assert.isUndefined(query, 'There should be no query on a prop with no tags');
    assert.equal(timesFind, 0, 'Find should be called zero times on a prop with no tags');
    assert.isUndefined(update, 'There should be no update on a prop with no tags');
    assert.equal(timesUpdate, 0, 'Update should be called zero times on a prop with no tags');
  });
  it('Migrates slot fillers up', function () {
    const collection = stubCollection();
    migratePropUp(exampleSlotFiller, collection);
    const { query, update } = collection.result();
    assert.deepEqual(query, { _id: 'DXPYsHKF6888h3hZs' }, 'The query should match the id of the given prop');
    assert.deepEqual(update, expectedSlotFillerUpdate, 'The update should match the expected update');
  });
  it('Merges tags when down migrating', function () {
    const collection = stubCollection();
    migratePropDown(DownMergeExample, collection);
    const { query, update } = collection.result();
    assert.deepEqual(query, { _id: 'DXPYsHKF6W8Hh3hZs' }, 'The query should match the id of the given prop');
    assert.deepEqual(update, expectedDownMergeUpdate, 'The update should match the expected update');
  });
});

// Create a stub for bulk udateOne operations that accepts a single op
function stubBulk() {
  let query, update, timesFind = 0, timesUpdate = 0;
  return {
    find(inputQuery) {
      query = inputQuery;
      timesFind += 1;
      return {
        updateOne(inputUpdate) {
          update = inputUpdate;
          timesUpdate += 1;
        }
      }
    },
    result() {
      return { query, update, timesFind, timesUpdate }
    }
  }
}

function stubCollection() {
  let query, update, timesFind = 0, timesUpdate = 0;
  return {
    update(inputQuery, inputUpdate) {
      query = inputQuery;
      timesUpdate += 1;
      update = inputUpdate;
    },
    result() {
      return { query, update, timesFind, timesUpdate }
    },
    _name: 'libraryNodes'
  }
}