import _variable from './computeByType/computeVariable';
import action from './computeByType/computeAction';
import attribute from './computeByType/computeAttribute';
import skill from './computeByType/computeSkill';
import pointBuy from './computeByType/computePointBuy';
import propertySlot from './computeByType/computeSlot';
import container from './computeByType/computeContainer';
import spellList from './computeByType/computeSpellList';
import toggle from './computeByType/computeToggle';
import trigger from './computeByType/computeTrigger';
import _calculation from './computeByType/computeCalculation';

export default Object.freeze({
  _variable,
  _calculation,
  action,
  attribute,
  container,
  skill,
  pointBuy,
  propertySlot,
  spell: action,
  spellList,
  toggle,
  trigger,
});
