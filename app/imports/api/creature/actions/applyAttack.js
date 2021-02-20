import roll from '/imports/parser/roll.js';

export default function applyAttack({
  prop,
  log,
  actionContext,
}){
  let value = roll(1, 20)[0];
  actionContext.attackRoll = {value};
  let result = value + prop.rollBonusResult;
  log.content.push({
    name: 'To Hit',
    resultPrefix: `1d20 [${value}] + ${prop.rollBonusResult} = `,
    result,
  });
}
