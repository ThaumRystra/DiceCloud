import constant from './constant.js';

const rollArray = {
  create({ values, diceSize, diceNum }) {
    return {
      parseType: 'rollArray',
      values: values.map(v => ({ value: v })),
      diceSize,
      diceNum,
    };
  },
  compile(node, scope, context) {
    return {
      result: node,
      context
    };
  },
  toString(node) {
    return `${node.diceNum || ''}d${node.diceSize} [${valuesToString(node.values)}]`;
  },
  reduce(node, scope, context) {
    const total = node.values.reduce((a, b) => {
      if (b.disabled) return a;
      return a + b.value;
    }, 0);
    return {
      result: constant.create({
        value: total,
      }),
      context,
    };
  },
}

function valuesToString(values) {
  return values.map(v => {
    let text = `${v.value}`;
    if (v.disabled) text = `~~${text}~~`;
    if (v.italics) text = `*${text}*`;
    if (v.bold) text = `**${text}**`;
    if (v.underline) text = `__${text}__`;
    return text;
  }).join(', ');
}

export default rollArray;
