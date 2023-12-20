import '/imports/api/simpleSchemaConfig';
import { docsToForest, calculateNestedSetOperations, getFilter, moveDocWithinRoot } from '/imports/api/parenting/parentingFunctions'
import { TreeDoc } from '/imports/api/parenting/ChildSchema';
import { assert } from 'chai';

function doc(_id, left, right, parentId?): TreeDoc {
  const doc = { _id, root: { id: 'root', collection: 'col' }, left, right, parentId };
  if (!parentId) delete doc.parentId;
  return doc;
}

function op(_id, left, right) {
  return {
    updateOne: {
      filter: { _id },
      update: { $set: { left, right } },
    },
  };
}

describe('Parenting with nested sets', function () {
  /**
   * Test the following structure
   * 
   *           1 Books 12
   *               ┃
   *        2 Programming 11
   *      ┏━━━━━━━━┻━━━━━━━━━┓
   * 3 Languages 4     5 Databases 10
   *                 ┏━━━━━━━┻━━━━━━━┓  
   *            6 MongoDB 7       8 dbm 9
   */
  it('Takes a set of documents and builds the forest', function () {
    const docArray: Array<TreeDoc> = [
      doc('Books', 1, 12),
      doc('Programming', 2, 11),
      doc('Languages', 3, 4),
      doc('Databases', 5, 10),
      doc('MongoDB', 6, 7),
      doc('dbm', 8, 9),
    ];
    const forest = docsToForest(docArray);
    assert.deepEqual(forest, [
      {
        doc: doc('Books', 1, 12), children: [
          {
            doc: doc('Programming', 2, 11), children: [
              { doc: doc('Languages', 3, 4), children: [] },
              {
                doc: doc('Databases', 5, 10), children: [
                  { doc: doc('MongoDB', 6, 7), children: [] },
                  { doc: doc('dbm', 8, 9), children: [] },
                ]
              }
            ]
          }
        ]
      }
    ]);
  });
  it('Can recalculate left and right for docs with set parents', function () {
    const docArray = [
      doc('Books', 71, 33, undefined),
      doc('Programming', 72, 33, 'Books'),
      doc('Languages', 73, 33, 'Programming'),
      doc('Databases', 74, 33, 'Programming'),
      doc('MongoDB', 75, 33, 'Databases'),
      doc('dbm', 76, 33, 'Databases'),
    ];
    const ops = calculateNestedSetOperations(docArray);
    assert.deepEqual(ops, [
      op('Books', 1, 12),
      op('Programming', 2, 11),
      op('Languages', 3, 4),
      op('Databases', 5, 10),
      op('MongoDB', 6, 7),
      op('dbm', 8, 9),
    ]);
  });
  it('Can recalculate left and right for docs with set parents in random order', function () {
    const docArray = [
      doc('MongoDB', 71, 33, 'Databases'),
      doc('Programming', 72, 33, 'Books'),
      doc('Languages', 73, 33, 'Programming'),
      doc('Books', 74, 33, undefined),
      doc('Databases', 75, 33, 'Programming'),
      doc('dbm', 76, 33, 'Databases'),
    ];
    const ops = calculateNestedSetOperations(docArray);
    assert.deepEqual(ops, [
      op('Books', 1, 12),
      op('Programming', 2, 11),
      op('Languages', 3, 4),
      op('Databases', 5, 10),
      op('MongoDB', 6, 7),
      op('dbm', 8, 9),
    ]);
  });
});

describe('Document tree filters can fetch other documents based on their position in the tree', function () {
  // Add the docs to a new collection
  /**
   * Test the following structure
   * 
   *           1 Books 12
   *               ┃
   *        2 Programming 11
   *      ┏━━━━━━━━┻━━━━━━━━━┓
   * 3 Languages 4     5 Databases 10
   *                 ┏━━━━━━━┻━━━━━━━┓  
   *            6 MongoDB 7       8 dbm 9
   */
  const treeCollection: Mongo.Collection<TreeDoc> = new Mongo.Collection('treeDocs');
  treeCollection.remove({});
  [
    doc('Books', 1, 12, undefined),
    doc('Programming', 2, 11, 'Books'),
    doc('Languages', 3, 4, 'Programming'),
    doc('Databases', 5, 10, 'Programming'),
    doc('MongoDB', 6, 7, 'Databases'),
    doc('dbm', 8, 9, 'Databases'),
  ].map(doc => {
    return treeCollection.insert(doc);
  });
  const docs: TreeDoc[] = treeCollection.find({}).fetch();

  it('Can filter ancestors', async function () {
    const ancestorIds: { [id: string]: string[] } = {};
    docs.forEach(doc => {
      ancestorIds[doc._id] = treeCollection.find(
        getFilter.ancestors(doc)
      ).map(doc => doc._id);
    });
    assert.isEmpty(ancestorIds['Books'], 'Books has no ancestors');
    assert.sameMembers(ancestorIds['Programming'], ['Books']);
    assert.sameMembers(ancestorIds['Languages'], ['Books', 'Programming']);
    assert.sameMembers(ancestorIds['Databases'], ['Books', 'Programming']);
    assert.sameMembers(ancestorIds['MongoDB'], ['Books', 'Programming', 'Databases']);
    assert.sameMembers(ancestorIds['dbm'], ['Books', 'Programming', 'Databases']);
  });

  it('Can filter descendants', async function () {
    const descendantIds: { [id: string]: string[] } = {};
    docs.forEach(doc => {
      descendantIds[doc._id] = treeCollection.find(
        getFilter.descendants(doc)
      ).map(doc => doc._id);
    });
    assert.isEmpty(descendantIds['MongoDB'], 'MongoDB has no descendants');
    assert.isEmpty(descendantIds['dbm'], 'dbm has no descendants');
    assert.isEmpty(descendantIds['Languages'], 'Languages has no descendants');
    assert.sameMembers(descendantIds['Databases'], ['dbm', 'MongoDB']);
    assert.sameMembers(descendantIds['Programming'], ['dbm', 'MongoDB', 'Languages', 'Databases']);
    assert.sameMembers(descendantIds['Books'], [
      'dbm', 'MongoDB', 'Languages', 'Databases', 'Programming'
    ]);
  });

  it('Can filter children', async function () {
    const childrenIds: { [id: string]: string[] } = {};
    docs.forEach(doc => {
      childrenIds[doc._id] = treeCollection.find(
        getFilter.children(doc)
      ).map(doc => doc._id);
    });
    assert.sameMembers(childrenIds['Books'], ['Programming']);
    assert.sameMembers(childrenIds['Programming'], ['Languages', 'Databases']);
    assert.isEmpty(childrenIds['Languages'], 'Languages has no children');
    assert.sameMembers(childrenIds['Databases'], ['dbm', 'MongoDB']);
    assert.isEmpty(childrenIds['MongoDB'], 'MongoDB has no children');
    assert.isEmpty(childrenIds['dbm'], 'dbm has no children');
  });

  it('Can filter parents', async function () {
    const parentIds: { [id: string]: string[] } = {};
    docs.forEach(doc => {
      parentIds[doc._id] = treeCollection.find(
        getFilter.parent(doc)
      ).map(doc => doc._id);
    });
    assert.isEmpty(parentIds['Books'], 'Books has no parent');
    assert.sameMembers(parentIds['Programming'], ['Books']);
    assert.sameMembers(parentIds['Languages'], ['Programming']);
    assert.sameMembers(parentIds['Databases'], ['Programming']);
    assert.sameMembers(parentIds['MongoDB'], ['Databases']);
    assert.sameMembers(parentIds['dbm'], ['Databases']);
  });
});

describe('Document can be moved without breaking the tree', function () {
  /**
  * Test the following structure
  * 
  *           1 Books 12                           13 Videos 24
  *               ┃                                     ┃
  *        2 Programming 11                        14 Cooking 23
  *      ┏━━━━━━━━┻━━━━━━━━━┓                  ┏━━━━━━━━┻━━━━━━━━━┓
  * 3 Languages 4     5 Databases 10      15 Meat 16         17 Vegetarian 22
  *                 ┏━━━━━━━┻━━━━━━━┓                     ┏━━━━━━━┻━━━━━━━┓
  *            6 MongoDB 7       8 dbm 9             18 Pasta 19        20 Mains 21
  */
  const treeCollection: Mongo.Collection<TreeDoc> = new Mongo.Collection('treeDocsMove');
  beforeEach(function () {
    treeCollection.remove({});
    [
      doc('Books', 1, 12, undefined),
      doc('Programming', 2, 11, 'Books'),
      doc('Languages', 3, 4, 'Programming'),
      doc('Databases', 5, 10, 'Programming'),
      doc('MongoDB', 6, 7, 'Databases'),
      doc('dbm', 8, 9, 'Databases'),
      doc('Videos', 13, 24, undefined),
      doc('Cooking', 14, 23, 'Videos'),
      doc('Meat', 15, 16, 'Cooking'),
      doc('Vegetarian', 17, 22, 'Cooking'),
      doc('Pasta', 18, 19, 'Vegetarian'),
      doc('Mains', 20, 21, 'Vegetarian'),
    ].map(doc => {
      return treeCollection.insert(doc);
    });
  });
  it('can move a document within its parent', async function () {
    const languagesDoc = await treeCollection.findOneAsync({ _id: 'Languages' });
    if (!languagesDoc) throw new Error('Languages doc not found');
    await moveDocWithinRoot(languagesDoc, treeCollection, 10.5);
    /**
     * Expected resulting structure
     *                   1 Books 12                            13 Videos 24
     *                       ┃                                      ┃
     *                2 Programming 11                        14 Cooking 23
     *              ┏━━━━━━━━┻━━━━━━━━━┓                   ┏━━━━━━━━┻━━━━━━━━━┓
     *         3 Databases 8     9 Languages 10       15 Meat 16         17 Vegetarian 22
     *        ┏━━━━━━━┻━━━━━━━┓                     ┏━━━━━━━┻━━━━━━━┓
     *   4 MongoDB 5       6 dbm 7             18 Pasta 19        20 Mains 21
     */
    const docs = await treeCollection.find({}, { sort: { left: 1 } }).fetchAsync();
    assert.deepEqual(docs, [
      doc('Books', 1, 12, undefined),
      doc('Programming', 2, 11, 'Books'),
      doc('Databases', 3, 8, 'Programming'),
      doc('MongoDB', 4, 5, 'Databases'),
      doc('dbm', 6, 7, 'Databases'),
      doc('Languages', 9, 10, 'Programming'),
      doc('Videos', 13, 24, undefined),
      doc('Cooking', 14, 23, 'Videos'),
      doc('Meat', 15, 16, 'Cooking'),
      doc('Vegetarian', 17, 22, 'Cooking'),
      doc('Pasta', 18, 19, 'Vegetarian'),
      doc('Mains', 20, 21, 'Vegetarian'),
    ]);
  });
  it('can move a document to a whole new parent', async function () {
    const videos = await treeCollection.findOneAsync({ _id: 'Videos' });
    if (!videos) throw new Error('Videos doc not found');
    await moveDocWithinRoot(videos, treeCollection, 6.5);
    /**
     * Expected resulting structure
     *           1 Books 24                
     *               ┃                     
     *        2 Programming 23             
     *      ┏━━━━━━━━┻━━━━━━━━━┓           
     * 3 Languages 4     5 Databases 22    
     *                 ┏━━━━━━━┻━━━━━━━┓   
     *            6 MongoDB 19       20 dbm 21
     *                 ┃
     *            7 Videos 18
     *                 ┃
     *            8 Cooking 17
     *        ┏━━━━━━━━┻━━━━━━━━━┓
     *   9 Meat 10         11 Vegetarian 16
     *                   ┏━━━━━━━┻━━━━━━━┓
     *              12 Pasta 13        14 Mains 15
     */
    const docs = await treeCollection.find({}, { sort: { left: 1 } }).fetchAsync();
    assert.deepEqual(docs, [
      doc('Books', 1, 24, undefined),
      doc('Programming', 2, 23, 'Books'),
      doc('Languages', 3, 4, 'Programming'),
      doc('Databases', 5, 22, 'Programming'),
      doc('MongoDB', 6, 19, 'Databases'),
      doc('Videos', 7, 18, 'MongoDB'),
      doc('Cooking', 8, 17, 'Videos'),
      doc('Meat', 9, 10, 'Cooking'),
      doc('Vegetarian', 11, 16, 'Cooking'),
      doc('Pasta', 12, 13, 'Vegetarian'),
      doc('Mains', 14, 15, 'Vegetarian'),
      doc('dbm', 20, 21, 'Databases'),
    ]);
  });
});


// TODO test moving between roots
