import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { ResolvedResult } from '../types/ResolvedResult';
import type { ResolveFunction } from '/imports/parser/types/ResolveFunction';
import type { ParseNodeFactory } from '/imports/parser/types/ParseNodeFactory';

export type IfNode = {
  parseType: 'if';
  condition: ParseNode;
  consequent: ParseNode;
  alternative: ParseNode;
}

type IfFactory = ParseNodeFactory<IfNode> & {
  resolve: ResolveFunction<IfNode>;
}

const ifNode: IfFactory = {
  create({ condition, consequent, alternative }) {
    return {
      parseType: 'if',
      condition,
      consequent,
      alternative,
    };
  },
  toString(node, stringOthers) {
    const { condition, consequent, alternative } = node;
    return `${stringOthers(condition)} ? ${stringOthers(consequent)} : ${stringOthers(alternative)}`
  },
  async resolve(fn, node, scope, context, inputProvider, resolveOthers): Promise<ResolvedResult> {
    const { result: condition } = await resolveOthers(fn, node.condition, scope, context, inputProvider);
    if (condition.parseType === 'constant') {
      if (condition.value) {
        return resolveOthers(fn, node.consequent, scope, context, inputProvider);
      } else {
        return resolveOthers(fn, node.alternative, scope, context, inputProvider);
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
  traverse(node, fn, traverseOthers) {
    fn(node);
    traverseOthers(node.condition, fn);
    traverseOthers(node.consequent, fn);
    traverseOthers(node.alternative, fn);
  },
  async map(node, fn, mapOthers) {
    const resultingNode = await fn(node);
    if (resultingNode === node) {
      node.condition = await mapOthers(node.condition, fn);
      node.consequent = await mapOthers(node.consequent, fn);
      node.alternative = await mapOthers(node.alternative, fn);
    }
    return resultingNode;
  },
}

export default ifNode;
