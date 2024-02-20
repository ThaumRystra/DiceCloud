import error from '/imports/parser/parseTree/error';
import rollArray from '/imports/parser/parseTree/rollArray';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import ResolveLevelFunction from '/imports/parser/types/ResolveLevelFunction';
import TraverseFunction from '/imports/parser/types/TraverseFunction';
import MapFunction from '/imports/parser/types/MapFunction';
import ToStringFunction from '/imports/parser/types/ToStringFunction';
import Context from '/imports/parser/types/Context';

export type RollNode = {
  parseType: 'roll';
  left: ParseNode;
  right: ParseNode;
}

type RollNodeFactory = {
  create(node: Partial<RollNode>): RollNode;
  compile: ResolveLevelFunction<RollNode>;
  roll: ResolveLevelFunction<RollNode>;
  reduce: ResolveLevelFunction<RollNode>;
  toString: ToStringFunction<RollNode>;
  traverse: TraverseFunction<RollNode>;
  map: MapFunction<RollNode>;
}

const rollNode: RollNodeFactory = {
  create({ left, right }: { left: ParseNode, right: ParseNode }) {
    return {
      parseType: 'roll',
      left,
      right,
    };
  },
  async compile(node, scope, context, inputProvider, resolveOthers) {
    const { result: left } = await resolveOthers('compile', node.left, scope, context, inputProvider);
    const { result: right } = await resolveOthers('compile', node.right, scope, context, inputProvider);
    return {
      result: rollNode.create({ left, right }),
      context,
    };
  },
  toString(node, stringOthers) {
    if (
      node.left.parseType === 'constant'
      && typeof node.left.value === 'number'
      && node.left.value === 1
    ) {
      return `d${stringOthers(node.right)}`;
    } else {
      return `${stringOthers(node.left)}d${stringOthers(node.right)}`;
    }
  },
  async roll(node, scope, context, inputProvider, resolveOthers) {
    const { result: left } = await resolveOthers('reduce', node.left, scope, context, inputProvider);
    const { result: right } = await resolveOthers('reduce', node.right, scope, context, inputProvider);
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
    const [values] = await inputProvider.rollDice([{ number, diceSize }]);
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
  async reduce(node, scope, context, inputProvider, resolveOthers) {
    const { result } = await rollNode.roll(node, scope, context, inputProvider, resolveOthers);
    return resolveOthers('reduce', result, scope, context, inputProvider);
  },
  traverse(node, fn, traverseOthers) {
    fn(node);
    traverseOthers(node.left, fn);
    traverseOthers(node.right, fn);
  },
  async map(node, fn, mapOthers) {
    const resultingNode = await fn(node);
    if (resultingNode === node) {
      node.left = await mapOthers(node.left, fn);
      node.right = await mapOthers(node.right, fn);
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
