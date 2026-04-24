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

export default function toString(node: ParseNode) {
  if (!node) return '';
  switch (node.parseType) {
    case 'accessor':
      return accessor.toString(node, toString);
    case 'array':
      return array.toString(node, toString);
    case 'call':
      return call.toString(node, toString);
    case 'constant':
      return constant.toString(node, toString);
    case 'error':
      return error.toString(node, toString);
    case 'if':
      return ifNode.toString(node, toString);
    case 'index':
      return indexNode.toString(node, toString);
    case 'not':
      return not.toString(node, toString);
    case 'operator':
      return operator.toString(node, toString);
    case 'parenthesis':
      return parenthesis.toString(node, toString);
    case 'roll':
      return rollNode.toString(node, toString);
    case 'rollArray':
      return rollArray.toString(node, toString);
    case 'symbol':
      return accessor.toString(node, toString);
    case 'unaryOperator':
      return unaryOperator.toString(node, toString);
  }
} 
