import roll from '/imports/parser/roll.js';

export default function applyAttack({
  prop,
  log,
  actionContext,
  creature,
}){
  let value = roll(1, 20)[0];
  actionContext.attackRoll = {value};
  let criticalHitTarget = creature.variables.criticalHitTarget &&
    creature.variables.criticalHitTarget.currentValue || 20;
  let criticalHit = value >= criticalHitTarget;
  if (criticalHit) actionContext.criticalHit = {value: true};
  let result = value + prop.rollBonusResult;
  actionContext.toHit = {value: result};

  log.content.push({
    name: criticalHit ? 'Critical Hit!' : 'To Hit',
    value: `1d20 [${value}] + ${prop.rollBonusResult} = ` + result,
  });
}
