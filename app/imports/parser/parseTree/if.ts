import ParseNode from '/imports/parser/parseTree/ParseNode';
import ResolvedResult from '../types/ResolvedResult';
import TraverseFunction from '/imports/parser/types/TraverseFunction';
import MapFunction from '/imports/parser/types/MapFunction';
import ResolveFunction from '/imports/parser/types/ResolveFunction';
import ToStringFunction from '/imports/parser/types/ToStringFunction';

export type IfNode = {
  parseType: 'if';
  condition: ParseNode;
  consequent: ParseNode;
  alternative: ParseNode;
}

type IfFactory = {
  create(node: Partial<IfNode>): IfNode;
  resolve: ResolveFunction<IfNode>;
  toString: ToStringFunction<IfNode>;
  traverse: TraverseFunction<IfNode>;
  map: MapFunction<IfNode>;
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
  toString(node, stringOthers) {
    const { condition, consequent, alternative } = node;
    condition.parseType
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
