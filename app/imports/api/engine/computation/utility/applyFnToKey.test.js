import applyFnToKey from './applyFnToKey';
import { assert } from 'chai';
import { get } from 'lodash';

describe('apply function to key', function () {
  it('uses a basic key correctly', function () {
    let obj = getStartingObject();
    applyFnToKey(obj, 'fox.name', (doc, key) => {
      assert.equal(obj, doc);
      assert.equal(key, 'fox.name');
      assert.equal(get(doc, key), 'foxy');
    });
  });
  it('uses a single nested key correctly', function () {
    let obj = getStartingObject();
    let foxSounds = [];
    applyFnToKey(obj, 'fox.sound.$', (doc, key) => {
      foxSounds.push(get(doc, key));
    });
    assert.include(foxSounds, 'wah');
    assert.include(foxSounds, 'tjoef');
    assert.include(foxSounds, 'kek');
  });
  it('uses a double nested key correctly', function () {
    let obj = getStartingObject();
    let birdSounds = [];
    applyFnToKey(obj, 'birds.$.sound.$', (doc, key) => {
      birdSounds.push(get(doc, key));
    });
    assert.include(birdSounds, 'koer');
    assert.include(birdSounds, 'hello');
    assert.include(birdSounds, 'squawk');
  });
});

function getStartingObject() {
  return {
    fox: {
      name: 'foxy',
      sound: [
        'tjoef',
        'kek',
        'wah'
      ]
    },
    birds: [{
      name: 'pigeon',
      sound: [
        'koer',
      ]
    }, {
      name: 'parrot',
      sound: [
        'hello',
        'cracker?',
        'squawk',
      ]
    }]
  }
}
