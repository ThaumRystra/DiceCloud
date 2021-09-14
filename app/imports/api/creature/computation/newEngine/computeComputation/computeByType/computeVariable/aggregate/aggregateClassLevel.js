export default function aggregateClassLevel({node, linkedNode, link}){
  if (link.data === 'classLevel'){
    if (node.data.inactive) return;
    if (!node.data.classLevelAggregator) node.data.classLevelAggregator = {
      levelsFilled: [true], // Level 0 is always filled
      level: 0,
    };
    let linkedProp = linkedNode.data;
    let aggregator = node.data.classLevelAggregator;
    if (linkedProp.level > aggregator.level) aggregator.level = linkedProp.level;
    aggregator.levelsFilled[linkedProp.level] = true;
  } else if (link.data === 'level'){
    node.baseValue = (node.baseValue || 0) + node.data.classLevelAggregator.level;
  }
}
