import constant from '/imports/parser/parseTree/constant';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import ResolveFunction from '/imports/parser/types/ResolveFunction';
import TraverseFunction from '/imports/parser/types/TraverseFunction';
import MapFunction from '/imports/parser/types/MapFunction';
import ToStringFunction from '/imports/parser/types/ToStringFunction';

export type NotNode = {
  parseType: 'not';
  right: ParseNode;
}

type NotFactory = {
  create(node: Partial<NotNode>): NotNode;
  resolve: ResolveFunction<NotNode>;
  toString: ToStringFunction<NotNode>;
  traverse: TraverseFunction<NotNode>;
  map: MapFunction<NotNode>;
}

const not: NotFactory = {
  create({ right }: { right: ParseNode }) {
    return {
      parseType: 'not',
      right,
    }
  },
  async resolve(fn, node, scope, context, inputProvider, resolveOthers) {
    const { result: right } = await resolveOthers(fn, node.right, scope, context, inputProvider);
    if (right.parseType !== 'constant') {
      return {
        result: not.create({
          right: right,
        }),
        context,
      };
    }
    return {
      result: constant.create({
        value: !right.value,
      }),
      context,
    };
  },
  toString(node, stringOthers) {
    return `!${stringOthers(node.right)}`;
  },
  traverse(node, fn, traverseOthers) {
    fn(node);
    traverseOthers(node.right, fn);
  },
  async map(node, fn, mapOthers) {
    const resultingNode = await fn(node);
    if (resultingNode === node) {
      node.right = await mapOthers(node.right, fn);
    }
    return resultingNode;
  },
}

export default not;
