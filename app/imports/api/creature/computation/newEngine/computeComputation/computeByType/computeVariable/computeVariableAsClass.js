export default function computeVariableAsAttribute(computation, node, prop){
  let classLevelAgg = node.data.classLevelAggregator;
  if (!classLevelAgg) return;
  prop.level = classLevelAgg.level;
  for (let index = 1; index < classLevelAgg.level; index++ ){
    const filled = classLevelAgg.levelsFilled[index];
    if (!filled){
      if (!prop.missingLevels) prop.missingLevels = [];
      prop.missingLevels.push(index);
    }
  }
  prop.missingLevels?.sort((a, b) => a - b);
}
