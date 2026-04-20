import constant from '/imports/parser/parseTree/constant';
import type { ResolveLevelFunction } from '/imports/parser/types/ResolveLevelFunction';
import type { ToStringFunction } from '/imports/parser/types/ToStringFunction';

type RollValue = {
  value: number,
  disabled?: true,
  disabledBy?: string,
  italics?: true,
  bold?: true,
  underline?: true,
}

export type RollArrayNode = {
  parseType: 'rollArray';
  values: RollValue[];
  diceSize: number,
  diceNum: number,
}

type RollArrayFactory = {
  create(input: { values: number[], diceSize: number, diceNum: number }): RollArrayNode;
  compile: ResolveLevelFunction<RollArrayNode>;
  reduce: ResolveLevelFunction<RollArrayNode>;
  toString: ToStringFunction<RollArrayNode>;
}

const rollArray: RollArrayFactory = {
  create({
    values, diceSize, diceNum
  }) {
    return {
      parseType: 'rollArray',
      values: values.map(v => ({ value: v })),
      diceSize,
      diceNum,
    };
  },
  compile(node, scope, context) {
    return Promise.resolve({
      result: node,
      context
    });
  },
  toString(node) {
    return `${node.diceNum || ''}d${node.diceSize} [${valuesToString(node.values)}]`;
  },
  reduce(node, scope, context) {
    const total = node.values.reduce((a, b) => {
      if (b.disabled) return a;
      return a + b.value;
    }, 0);
    return Promise.resolve({
      result: constant.create({
        value: total,
      }),
      context,
    });
  },
}

function valuesToString(values: RollValue[]) {
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
