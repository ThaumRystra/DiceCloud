import rollDice from '/imports/parser/rollDice.js';

export default function applyAttack({
  prop,
  log,
  actionContext,
  creature,
}){
  let value = rollDice(1, 20)[0];
  actionContext.attackRoll = {value};
  let criticalHitTarget = creature.variables.criticalHitTarget &&
    creature.variables.criticalHitTarget.value || 20;
  let criticalHit = value >= criticalHitTarget;
  if (criticalHit) actionContext.criticalHit = {value: true};
  let result = value + prop.rollBonusResult;
  actionContext.toHit = {value: result};

  log.content.push({
    name: criticalHit ? 'Critical Hit!' : 'To Hit',
    value: `1d20 [${value}] + ${prop.rollBonusResult} = ` + result,
  });
}
