import computeAction from './computeAction.testFn.js';
import computeAttribute from './computeAttribute.testFn.js';
import computeClasses from './computeClasses.testFn.js';
import computeConstants from './computeConstants.testFn.js';
import computeInventory from './computeInventory.testFn.js';
import computeDamageMultipliers from './computeDamageMultipliers.testFn.js';
import computeEffects from './computeEffects.testFn.js';
import computeSkills from './computeSkills.testFn.js';
import computeProficiencies from './computeProficiencies.testFn.js';

export default [{
  text: 'Computes actions',
  fn: computeAction,
}, {
  text: 'Computes attributes',
  fn: computeAttribute,
}, {
  text: 'Computes classes',
  fn: computeClasses,
}, {
  text: 'Computes constants',
  fn: computeConstants,
}, {
  text: 'Computes inventory',
  fn: computeInventory,
}, {
  text: 'Computes damage multipliers',
  fn: computeDamageMultipliers,
}, {
  text: 'Computes effects',
  fn: computeEffects,
}, {
  text: 'Computes skills',
  fn: computeSkills,
}, {
  text: 'Computes proficiencies',
  fn: computeProficiencies,
}];
