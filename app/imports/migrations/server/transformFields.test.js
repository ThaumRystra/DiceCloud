import transformFields from './transformFields';
import { assert } from 'chai';

const originalDoc = {
  name: 'doc name',
  description: 'a document to test transforms on',
  nest: {
    deeper: {
      field: 'some nested field'
    },
  },
  array: [{ num: 1 }, { num: 3 }, { num: 5 }],
  nestArray: [
    { array: [{ item: 2 }, { item: 4 }, { item: 6 }] },
    { array: [{ item: 8 }, { item: 10 }, { item: 12 }] },
    { array: [{ item: 14 }, { item: 16 }, { item: 18 }] },
  ],
};

describe('transformFields', function () {

  it('Takes a doc and transforms it according to single field rules', function () {
    let doc = { ...originalDoc };
    const transformList = [
      { from: 'name', to: 'title' },
    ];

    assert.equal(doc.name, 'doc name', '.name is set');
    assert.doesNotHaveAnyKeys(doc, ['title'], '.title doesn\'t exist');

    doc = transformFields(doc, transformList);

    assert.equal(doc.title, 'doc name', '.name -> .title');
    assert.doesNotHaveAnyKeys(doc, ['name'], '.name deleted');
  });

  it('Takes a doc and transforms it with functions', function () {
    let doc = { ...originalDoc };
    const transformList = [
      { from: 'name', to: 'name', up: name => name.toUpperCase() },
    ];
    assert.equal(doc.name, 'doc name', 'name in lowercase');
    doc = transformFields(doc, transformList);
    assert.equal(doc.name, 'DOC NAME', 'name in uppercase');
  });

  it('Creates objects on the fly', function () {
    let doc = { ...originalDoc };
    const transformList = [
      { from: 'name', to: 'newObj.name' },
    ];
    doc = transformFields(doc, transformList);
    assert.deepEqual(doc.newObj, { name: 'doc name' });
  });

  it('Handles empty to and from fields', function () {
    let doc = { ...originalDoc };
    const transformList = [
      { to: 'created', up: () => 'from thin air' },
      { from: 'description' },
    ];
    doc = transformFields(doc, transformList);
    assert.equal(doc.created, 'from thin air', 'created field success');
    assert.doesNotHaveAnyKeys(doc, ['description'], '.description deleted');
  });

  it('Takes a nested field and transforms it into a different nested field', function () {
    let doc = { ...originalDoc };
    const transformList = [
      { from: 'nest.deeper', to: 'different.deep' },
    ];
    doc = transformFields(doc, transformList);
    assert.equal(doc.different.deep.field, 'some nested field', 'field moved correctly');
    assert.doesNotHaveAnyKeys(doc.nest, ['deeper'], 'doc.nest.deeper deleted');
  });

  it('Transforms arrays', function () {
    let doc = { ...originalDoc };
    const transformList = [
      { from: 'array.$.num', to: 'list.$.number' },
    ];
    doc = transformFields(doc, transformList);
    assert.equal(doc.list[1].number, 3, 'array field moved correctly');
  });

  it('Transforms deep arrays', function () {
    let doc = { ...originalDoc };
    const transformList = [
      { from: 'nestArray.$.array.$.item', to: 'nestList.$.list.$.ting' },
    ];
    doc = transformFields(doc, transformList);
    assert.equal(doc.nestList[2].list[1].ting, 16, 'nested array field moved correctly');
  });
});
