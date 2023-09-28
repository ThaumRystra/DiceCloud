import { docsToForest, calculateNestedSetOperations, getFilter } from '/imports/api/parenting/parentingFunctions'
import { TreeDoc } from '/imports/api/parenting/ChildSchema';
import { assert } from 'chai';

function doc(_id, left, right, parentId?): TreeDoc {
  return { _id, root: { id: 'root', collection: 'col' }, left, right, parentId };
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




