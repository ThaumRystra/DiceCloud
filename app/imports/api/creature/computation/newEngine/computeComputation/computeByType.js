import _variable from './computeByType/computeVariable.js';
import action from './computeByType/computeAction.js';
import attribute from './computeByType/computeAttribute.js';
import slot from './computeByType/computeSlot.js';
import container from './computeByType/computeContainer.js';

export default Object.freeze({
  _variable,
  action,
  attack: action,
  attribute,
  container,
  slot,
});
