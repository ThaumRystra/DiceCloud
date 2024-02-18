import constant from './constant';
import NodeFactory from '/imports/parser/parseTree/NodeFactory';
import { Context, ResolvedResult } from '/imports/parser/resolve';

type RollValue = {
  value: number,
  disabled?: true,
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

interface RollArrayFactory extends NodeFactory {
  create(input: { values: number[], diceSize: number, diceNum: number }): RollArrayNode;
  compile(
    node: RollArrayNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  roll?: undefined;
  reduce(
    node: RollArrayNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  resolve?: undefined;
  toString(node: RollArrayNode): string;
  traverse?: undefined;
  map?: undefined;
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
