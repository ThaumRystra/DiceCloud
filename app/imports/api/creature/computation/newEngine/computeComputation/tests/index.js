import computeAction from './computeAction.testFn.js';
import computeAttribute from './computeAttribute.testFn.js';
import computeClasses from './computeClasses.testFn.js';
import computeConstants from './computeConstants.testFn.js';

export default [{
  text: 'Computes actions',
  fn: computeAction,
},{
  text: 'Computes attributes',
  fn: computeAttribute,
},{
  text: 'Computes classes',
  fn: computeClasses,
},{
  text: 'Computes constants',
  fn: computeConstants,
}];
