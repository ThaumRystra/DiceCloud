import roll from '/imports/parser/roll.js';

export default function applyAttack({
  prop,
  log,
}){
  let result = roll(1, 20)[0] + prop.rollBonusResult;
  log.content.push({
    // If this is not the first item in the log content, give it a name
    name: log.content.length ? prop.name + ' attack' : undefined,
    result,
    details: 'to hit',
  });
}
