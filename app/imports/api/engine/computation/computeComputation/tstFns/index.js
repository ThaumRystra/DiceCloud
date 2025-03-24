import computeAction from './computeAction.testFn';
import computeAttribute from './computeAttribute.testFn';
import computeCalculations from './computeCalculations.testFn';
import computeClasses from './computeClasses.testFn';
import computeConstants from './computeConstants.testFn';
import computeInventory from './computeInventory.testFn';
import computeDamageMultipliers from './computeDamageMultipliers.testFn';
import computeEffects from './computeEffects.testFn';
import computeSkills from './computeSkills.testFn';
import computeProficiencies from './computeProficiencies.testFn';
import computePointBuys from './computePointBuys.testFn';

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
