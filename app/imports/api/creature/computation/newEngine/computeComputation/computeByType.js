import _variable from './computeByType/computeVariable.js';
import action from './computeByType/computeAction.js';
import attribute from './computeByType/computeAttribute.js';
import slot from './computeByType/computeSlot.js';

export default Object.freeze({
  _variable,
  action,
  attack: action,
  attribute,
  slot,
});
