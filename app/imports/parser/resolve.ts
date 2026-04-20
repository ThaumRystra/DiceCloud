import '/imports/parser/parseTree/array';
import factories from '/imports/parser/parseTree';
import type { InputProvider, CheckParams } from '/imports/api/engine/action/functions/userInput/InputProvider';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import rollDice from '/imports/parser/rollDice';
import type { ResolveLevel } from './types/ResolveLevel';
import type { ResolvedResult } from './types/ResolvedResult';
import Context from './types/Context';
import type { ResolveLevelFunction } from '/imports/parser/types/ResolveLevelFunction';
import type { Variables } from '/imports/api/engine/computation/CreatureComputation';

// Takes a parse node and computes it to a set detail level
// returns {result, context}
export default async function resolve(
  fn: ResolveLevel,
  node: ParseNode,
  scope: Variables = {},
  context = new Context(),
  inputProvider = computationInputProvider,
): Promise<ResolvedResult> {
  if (!node) throw new Error('Node must be supplied');
  const factory = factories[node.parseType];
  if (!factory) {
    throw new Meteor.Error(`Parse node type: ${node.parseType} not implemented`);
  }
  const handlerFunction = getHandlerFunction(fn, factory);
  if ('resolve' in factory) {
    return factory.resolve(fn, node as never, scope, context, inputProvider, resolve);
  } else if (handlerFunction) {
    return handlerFunction(node, scope, context, inputProvider, resolve);
  } else if (fn === 'reduce' && 'roll' in factory) {
    return factory.roll(node as never, scope, context, inputProvider, resolve)
  } else if (factory.compile) {
    return factory.compile(node as never, scope, context, inputProvider, resolve)
  } else {
    throw new Meteor.Error('Compile not implemented on ' + node.parseType);
  }
}

function getHandlerFunction<T extends ParseNode>(
  fn: ResolveLevel, factory: typeof factories[T['parseType']]
): ResolveLevelFunction<T> | undefined {
  if (!(fn in factory)) return;
  if (fn === 'roll' && 'roll' in factory) {
    return factory.roll as ResolveLevelFunction<T>;
  } else if (fn === 'reduce' && 'reduce' in factory) {
    return factory.reduce as ResolveLevelFunction<T>;
  } else if (fn === 'compile' && 'compile' in factory) {
    return factory.compile as ResolveLevelFunction<T>;
  }
}

/* eslint-disable @typescript-eslint/require-await */
const computationInputProvider: InputProvider = {
  /**
   * By default, just roll the dice as usual
   */
  async rollDice(dice) {
    return dice.map(d => rollDice(d.number, d.diceSize));
  },
  /**
   * By default just choose the minimum number of options from the front of the list
   */
  async choose(choices, quantity = [1, 1]) {
    const chosen: string[] = [];
    const choiceQuantity = quantity[0] <= 0 ? 1 : quantity[0];
    for (let i = 0; i < choiceQuantity && i < choices.length; i += 1) {
      chosen.push(choices[i]._id);
    }
    return chosen;
  },
  async targetIds() {
    return [];
  },
  async advantage() {
    return 0;
  },
  async check(input: CheckParams) {
    return input;
  },
  async castSpell(input: CastSpellParams) {
    return input;
  },
}
