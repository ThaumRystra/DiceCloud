import { get } from 'lodash';
import computeStat from '/imports/api/creature/computation/computeStat.js';

export default function computedValueOfVariableName(name, memo){
  let path = name.split('.');
  let statName = path[0];
  let statPath = path.slice(1);
  const stat = get(memo.statsByVariableName, statName);
  if (!stat) return null;
  if (!stat.computationDetails.computed){
    computeStat(stat, memo);
  }
  return statPath.length ? get(stat, statPath) : stat.value;
}
