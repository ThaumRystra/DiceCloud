import resolve, { traverse, toString, map } from '../resolve';
import NodeFactory, { ResolveLevel } from '/imports/parser/parseTree/NodeFactory';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import { Context, ResolvedResult } from '/imports/parser/resolve';

export type IfNode = {
  parseType: 'if';
  condition: ParseNode;
  consequent: ParseNode;
  alternative: ParseNode;
}

interface IfFactory extends NodeFactory {
  create(node: Partial<IfNode>): IfNode;
  compile?: undefined;
  roll?: undefined;
  reduce?: undefined;
  resolve(
    fn: ResolveLevel, node: IfNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  toString(node: IfNode): string;
  traverse(node: IfNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  map(node: IfNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
}

const ifNode: IfFactory = {
  create(
    { condition, consequent, alternative }:
      { condition: ParseNode, consequent: ParseNode, alternative: ParseNode }
  ) {
    return {
      parseType: 'if',
      condition,
      consequent,
      alternative,
    };
  },
  toString(node) {
    const { condition, consequent, alternative } = node;
    condition.parseType
    return `${toString(condition)} ? ${toString(consequent)} : ${toString(alternative)}`
  },
  resolve(fn, node, scope, context): ResolvedResult {
    const { result: condition } = resolve(fn, node.condition, scope, context);
    if (condition.parseType === 'constant') {
      if (condition.value) {
        return resolve(fn, node.consequent, scope, context);
      } else {
        return resolve(fn, node.alternative, scope, context);
      }
    } else {
      return {
        result: ifNode.create({
          condition: condition,
          consequent: node.consequent,
          alternative: node.alternative,
        }),
        context,
      };
    }
  },
  traverse(node, fn) {
    fn(node);
    traverse(node.condition, fn);
    traverse(node.consequent, fn);
    traverse(node.alternative, fn);
  },
  map(node, fn) {
    const resultingNode = fn(node);
    if (resultingNode === node) {
      node.condition = map(node.condition, fn);
      node.consequent = map(node.consequent, fn);
      node.alternative = map(node.alternative, fn);
    }
    return resultingNode;
  },
}

export default ifNode;
