import resolve, { toString, traverse, map, ResolvedResult, Context } from '../resolve';
import error from './error';
import rollArray from './rollArray';
import rollDice from '/imports/parser/rollDice';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import NodeFactory from '/imports/parser/parseTree/NodeFactory';

export type RollNode = {
  parseType: 'roll';
  left: ParseNode;
  right: ParseNode;
}

interface RollNodeFactory extends NodeFactory {
  create(node: Partial<RollNode>): RollNode;
  compile(
    node: RollNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  roll(
    node: RollNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  reduce(
    node: RollNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  resolve?: undefined;
  toString(node: RollNode): string;
  traverse(node: RollNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  map(node: RollNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
}

const rollNode: RollNodeFactory = {
  create({ left, right }: { left: ParseNode, right: ParseNode }) {
    return {
      parseType: 'roll',
      left,
      right,
    };
  },
  compile(node, scope, context) {
    const { result: left } = resolve('compile', node.left, scope, context);
    const { result: right } = resolve('compile', node.right, scope, context);
    return {
      result: rollNode.create({ left, right }),
      context,
    };
  },
  toString(node) {
    if (
      node.left.parseType === 'constant'
      && typeof node.left.value === 'number'
      && node.left.value === 1
    ) {
      return `d${toString(node.right)}`;
    } else {
      return `${toString(node.left)}d${toString(node.right)}`;
    }
  },
  roll(node, scope, context) {
    const { result: left } = resolve('reduce', node.left, scope, context);
    const { result: right } = resolve('reduce', node.right, scope, context);
    if (
      left.parseType !== 'constant'
      || typeof left.value !== 'number'
      || !Number.isInteger(left.value)
    ) {
      return errorResult('Number of dice is not an integer', node, context);
    }
    if (
      right.parseType !== 'constant'
      || typeof right.value !== 'number'
      || !Number.isInteger(right.value)
    ) {
      return errorResult('Dice size is not an integer', node, context);
    }
    let number = left.value;
    if (context.options.doubleRolls) {
      number *= 2;
    }
    if (number > STORAGE_LIMITS.diceRollValuesCount) {
      const message = `Can't roll more than ${STORAGE_LIMITS.diceRollValuesCount} dice at once`;
      return errorResult(message, node, context);
    }
    const diceSize = right.value;
    const values = rollDice(number, diceSize);
    if (context) {
      context.rolls.push({ number, diceSize, values });
    }
    return {
      result: rollArray.create({
        values,
        diceSize,
        diceNum: left.value,
      }),
      context
    };
  },
  reduce(node, scope, context) {
    const { result } = rollNode.roll(node, scope, context);
    return resolve('reduce', result, scope, context);
  },
  traverse(node, fn) {
    fn(node);
    traverse(node.left, fn);
    traverse(node.right, fn);
  },
  map(node, fn) {
    const resultingNode = fn(node);
    if (resultingNode === node) {
      node.left = map(node.left, fn);
      node.right = map(node.right, fn);
    }
    return resultingNode;
  },
}

function errorResult(message: string, node: RollNode, context: Context) {
  context.error(message);
  return {
    result: error.create({ node, error: message }),
    context,
  };
}

export default rollNode;
