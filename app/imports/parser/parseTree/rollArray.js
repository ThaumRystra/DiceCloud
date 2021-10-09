import constant from './constant.js';

const rollArray = {
  constructor({values, diceSize, diceNum}) {
		return {
      parseType: 'rollArray',
      values,
      diceSize,
      diceNum,
    };
  },
  compile(node, scope, context){
    return {
      result: node,
      context
    };
  },
  toString(node){
    return `[${node.values.join(', ')}]`;
  },
  reduce(node, scope, context){
    const total = node.values.reduce((a, b) => a + b, 0);
    return {
      result: constant.create({
        value: total,
      }),
      context,
    };
  },
}

export default rollArray;
