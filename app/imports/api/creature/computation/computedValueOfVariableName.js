import computeStat from '/imports/api/creature/computation/computeStat.js';

export default function computedValueOfVariableName(sub, memo){
  const stat = memo.statsByVariableName[sub];
  if (!stat) return null;
  if (!stat.computationDetails.computed){
    computeStat(stat, char);
  }
  return stat.result;
}
