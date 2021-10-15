import '/imports/api/simpleSchemaConfig.js';
//import testTypes from './testTypes/index.js';
import { doActionWork } from './doAction.js';
import createAction from './tests/createAction.testFn.js';

describe('Do Action', function(){
  it('Does an empty action', function(){
    doActionWork(createAction({properties: [{type: 'action'}]}));
  });
  //testTypes.forEach(test => it(test.text, test.fn));
});
