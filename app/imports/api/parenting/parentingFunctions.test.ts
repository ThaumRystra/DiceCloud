import { docsToForest, calculateNestedSetOperations } from '/imports/api/parenting/parentingFunctions'
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
