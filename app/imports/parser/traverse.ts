import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
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

export function traverse(node: ParseNode, fn: (p: ParseNode) => void): void {
  if (!node) return;
  switch (node.parseType) {
    case 'accessor':
      return accessor.traverse(node, fn, traverse);
    case 'array':
      return array.traverse(node, fn, traverse);
    case 'call':
      return call.traverse(node, fn, traverse);
    case 'constant':
      return constant.traverse(node, fn, traverse);
    case 'error':
      return error.traverse(node, fn, traverse);
    case 'if':
      return ifNode.traverse(node, fn, traverse);
    case 'index':
      return indexNode.traverse(node, fn, traverse);
    case 'not':
      return not.traverse(node, fn, traverse);
    case 'operator':
      return operator.traverse(node, fn, traverse);
    case 'parenthesis':
      return parenthesis.traverse(node, fn, traverse);
    case 'roll':
      return rollNode.traverse(node, fn, traverse);
    case 'rollArray':
      return rollArray.traverse(node, fn, traverse);
    case 'symbol':
      return accessor.traverse(node, fn, traverse);
    case 'unaryOperator':
      return unaryOperator.traverse(node, fn, traverse);
  }
} 
