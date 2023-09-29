import { migrateCollection } from './dbv3'
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assert } from 'chai';

describe('dbv3 Migrate parenting structure', function () {
  // We are going to be adding malformed docs to the collection, so allow any
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const collection = CreatureProperties as Mongo.Collection<any>;

  this.beforeAll(async function () {
    // Add only the required properties
    await collection.removeAsync({});
    // Add a property and a child as if they were in schema v2
    // Use raw collection to bypass all schemas and validation
    await collection.rawCollection().insertMany([
      {
        '_id': 'classId',
        'type': 'class',
        'parent': { 'collection': 'creatures', 'id': 'creatureId' },
        'ancestors': [
          { 'collection': 'creatures', 'id': 'creatureId' }
        ],
        'order': 0,
        'tags': [],
      }, {
        '_id': 'noteId',
        'type': 'note',
        'parent': { 'collection': 'creatureProperties', 'id': 'classId' },
        'ancestors': [
          { 'collection': 'creatures', 'id': 'creatureId' },
          { 'collection': 'creatureProperties', 'id': 'classId' }
        ],
        'order': 1,
        'tags': [],
      },
    ]);
  });

  this.afterAll(async function () {
    // Remove all the properties
    await collection.removeAsync({});
  });

  it('Migrates parenting to the new schema', async function () {
    // Migrate the collection
    await migrateCollection('creatureProperties');

    // Get the new documents
    const parentDoc = await collection.findOneAsync('classId');
    const childDoc = await collection.findOneAsync('noteId');

    assert.deepEqual(
      parentDoc.root, { collection: 'creatures', id: 'creatureId' },
      'parent root should be the creature'
    );
    assert.deepEqual(
      childDoc.root, { collection: 'creatures', id: 'creatureId' },
      'child root should be the creature'
    );

    assert.doesNotHaveAnyKeys(parentDoc, ['parentId'], 'Parent should not have parentId set');
    assert.equal(childDoc.parentId, 'classId', 'child parentId should match parent\'s id');

    assert.equal(parentDoc.left, 0, 'Parent left should be its old order');
    assert.equal(childDoc.left, 1, 'Child left should be its old order');

  });

});
