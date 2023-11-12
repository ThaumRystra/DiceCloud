import computeAction from './computeAction.testFn.js';
import computeAttribute from './computeAttribute.testFn.js';
import computeCalculations from './computeCalculations.testFn.js';
import computeClasses from './computeClasses.testFn.js';
import computeConstants from './computeConstants.testFn.js';
import computeInventory from './computeInventory.testFn.js';
import computeDamageMultipliers from './computeDamageMultipliers.testFn.js';
import computeEffects from './computeEffects.testFn.js';
import computeSkills from './computeSkills.testFn.js';
import computePointBuys from './computePointBuys.testFn.js';
import computeProficiencies from './computeProficiencies.testFn.js';

export default [{
  text: 'Computes actions',
  fn: computeAction,
}, {
  text: 'Computes attributes',
  fn: computeAttribute,
}, {
  text: 'Computes calculations',
  fn: computeCalculations,
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
  text: 'Computes point buys',
  fn: computePointBuys,
}, {
  text: 'Computes proficiencies',
  fn: computeProficiencies,
}];
