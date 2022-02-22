import { parse } from './parser';
import { assert } from 'chai';

describe('Parser', function(){
  it('parses valid text without error', function(){
    assert.typeOf(parse('1'), 'object');
  });
  it('parses various operations', function(){
    assert.typeOf(parse('1 + 2 * 3 / 4 * 1d8'), 'object');
  });
});
