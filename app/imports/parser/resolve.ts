import '/imports/parser/parseTree/array';
import type { InputProvider, CheckParams } from '/imports/api/engine/action/functions/userInput/InputProvider';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import rollDice from '/imports/parser/rollDice';
import type { ResolveLevel } from './types/ResolveLevel';
import type { ResolvedResult } from './types/ResolvedResult';
import Context from './types/Context';
import type { Variables } from '/imports/api/engine/computation/CreatureComputation';
import accessor from '/imports/parser/parseTree/accessor';
import constant from '/imports/parser/parseTree/constant';
import error from '/imports/parser/parseTree/error';
import rollArray from '/imports/parser/parseTree/rollArray';
import unaryOperator from '/imports/parser/parseTree/unaryOperator';
import array from '/imports/parser/parseTree/array';
import call from '/imports/parser/parseTree/call';
import ifNode from '/imports/parser/parseTree/if';
import indexNode from '/imports/parser/parseTree/indexNode';
import not from '/imports/parser/parseTree/not';
import operator from '/imports/parser/parseTree/operator';
import parenthesis from '/imports/parser/parseTree/parenthesis';
import rollNode from '/imports/parser/parseTree/roll';

// Takes a parse node and computes it to a set detail level
// returns {result, context}
export default async function resolve<T extends ParseNode>(
  fn: ResolveLevel,
  node: T,
  scope: Variables = {},
  context = new Context(),
  inputProvider = computationInputProvider,
): Promise<ResolvedResult> {
  if (!node) throw new Error('Node must be supplied');
  switch (fn) {
    case 'compile': return compile(node, scope, context, inputProvider);
    case 'roll': return roll(node, scope, context, inputProvider);
    case 'reduce': return reduce(node, scope, context, inputProvider);
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
  // async castSpell(input: CastSpellParams) {
  //   return input;
  // },
}

function reduce(node: ParseNode, scope: Variables, context: Context, inputProvider: InputProvider): Promise<ResolvedResult> {
  if (!node) return node;
  const fn = 'reduce' as const;
  switch (node.parseType) {
    case 'accessor':
      return accessor.reduce(node, scope, context, inputProvider, resolve);
    case 'array':
      return array.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'call':
      return call.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'constant':
      return constant.compile(node, scope, context, inputProvider, resolve);
    case 'error':
      return error.compile(node, scope, context, inputProvider, resolve);
    case 'if':
      return ifNode.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'index':
      return indexNode.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'not':
      return not.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'operator':
      return operator.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'parenthesis':
      return parenthesis.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'roll':
      return rollNode.reduce(node, scope, context, inputProvider, resolve);
    case 'rollArray':
      return rollArray.reduce(node, scope, context, inputProvider, resolve);
    case 'symbol':
      return accessor.reduce(node, scope, context, inputProvider, resolve);
    case 'unaryOperator':
      return unaryOperator.resolve(fn, node, scope, context, inputProvider, resolve);
  }
}

function roll(node: ParseNode, scope: Variables, context: Context, inputProvider: InputProvider): Promise<ResolvedResult> {
  if (!node) return node;
  const fn = 'roll' as const;
  switch (node.parseType) {
    case 'accessor':
      return accessor.compile(node, scope, context, inputProvider, resolve);
    case 'array':
      return array.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'call':
      return call.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'constant':
      return constant.compile(node, scope, context, inputProvider, resolve);
    case 'error':
      return error.compile(node, scope, context, inputProvider, resolve);
    case 'if':
      return ifNode.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'index':
      return indexNode.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'not':
      return not.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'operator':
      return operator.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'parenthesis':
      return parenthesis.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'roll':
      return rollNode.roll(node, scope, context, inputProvider, resolve);
    case 'rollArray':
      return rollArray.compile(node, scope, context, inputProvider, resolve);
    case 'symbol':
      return accessor.compile(node, scope, context, inputProvider, resolve);
    case 'unaryOperator':
      return unaryOperator.resolve(fn, node, scope, context, inputProvider, resolve);
  }
}

function compile(node: ParseNode, scope: Variables, context: Context, inputProvider: InputProvider): Promise<ResolvedResult> {
  if (!node) return node;
  const fn = 'compile' as const;
  switch (node.parseType) {
    case 'accessor':
      return accessor.compile(node, scope, context, inputProvider, resolve);
    case 'array':
      return array.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'call':
      return call.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'constant':
      return constant.compile(node, scope, context, inputProvider, resolve);
    case 'error':
      return error.compile(node, scope, context, inputProvider, resolve);
    case 'if':
      return ifNode.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'index':
      return indexNode.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'not':
      return not.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'operator':
      return operator.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'parenthesis':
      return parenthesis.resolve(fn, node, scope, context, inputProvider, resolve);
    case 'roll':
      return rollNode.compile(node, scope, context, inputProvider, resolve);
    case 'rollArray':
      return rollArray.compile(node, scope, context, inputProvider, resolve);
    case 'symbol':
      return accessor.compile(node, scope, context, inputProvider, resolve);
    case 'unaryOperator':
      return unaryOperator.resolve(fn, node, scope, context, inputProvider, resolve);
  }
}
