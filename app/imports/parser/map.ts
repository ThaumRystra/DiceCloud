import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import array from '/imports/parser/parseTree/array';
import call from '/imports/parser/parseTree/call';
import ifNode from '/imports/parser/parseTree/if';
import index from '/imports/parser/parseTree/indexNode';
import not from '/imports/parser/parseTree/not';
import operator from '/imports/parser/parseTree/operator';
import parenthesis from '/imports/parser/parseTree/parenthesis';
import roll from '/imports/parser/parseTree/roll';
import unaryOperator from '/imports/parser/parseTree/unaryOperator';

export default async function map(node: ParseNode, fn: (p: ParseNode) => Promise<ParseNode>): Promise<ParseNode> {
  if (!node) return node;
  switch (node.parseType) {
    case 'accessor':
      return fn(node);
    case 'array':
      return array.map(node, fn, map);
    case 'call':
      return call.map(node, fn, map);
    case 'constant':
      return fn(node);
    case 'error':
      return fn(node);
    case 'if':
      return ifNode.map(node, fn, map);
    case 'index':
      return index.map(node, fn, map);
    case 'not':
      return not.map(node, fn, map);
    case 'operator':
      return operator.map(node, fn, map);
    case 'parenthesis':
      return parenthesis.map(node, fn, map);
    case 'roll':
      return roll.map(node, fn, map);
    case 'rollArray':
      return fn(node);
    case 'symbol':
      return fn(node);
    case 'unaryOperator':
      return unaryOperator.map(node, fn, map);
    default:
      return fn(node);
  }
}
