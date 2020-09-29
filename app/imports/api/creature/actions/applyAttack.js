import math from '/imports/math.js';
import {insertCreatureLog} from '/imports/api/creature/log/CreatureLogs.js';

export default function applyAttack({
  prop,
  //children,
  creature,
  //targets,
  //actionContext
}){
  let result = math.roll(1, 20) + prop.rollBonusResult;
  insertCreatureLog({
    log: `${prop.name} attack. ${result} to hit`,
    creature,
  });
}
