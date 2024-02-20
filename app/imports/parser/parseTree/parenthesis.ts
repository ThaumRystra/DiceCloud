import ParseNode from '/imports/parser/parseTree/ParseNode';
import ResolveFunction from '/imports/parser/types/ResolveFunction';
import TraverseFunction from '/imports/parser/types/TraverseFunction';
import MapFunction from '/imports/parser/types/MapFunction';
import ToStringFunction from '/imports/parser/types/ToStringFunction';

export type ParenthesisNode = {
  parseType: 'parenthesis';
  content: ParseNode;
}

type ParenthesisFactory = {
  create(node: Partial<ParenthesisNode>): ParenthesisNode;
  resolve: ResolveFunction<ParenthesisNode>;
  toString: ToStringFunction<ParenthesisNode>;
  traverse: TraverseFunction<ParenthesisNode>;
  map: MapFunction<ParenthesisNode>;
}

const parenthesis: ParenthesisFactory = {
  create({ content }: { content: ParseNode }) {
    return {
      parseType: 'parenthesis',
      content,
    };
  },
  async resolve(fn, node, scope, context, inputProvider, resolveOthers) {
    const { result: content } = await resolveOthers(fn, node.content, scope, context, inputProvider);
    if (
      fn === 'reduce' ||
      content.parseType === 'constant' ||
      content.parseType === 'error'
    ) {
      return { result: content, context };
    } else {
      return {
        result: parenthesis.create({ content }),
        context
      };
    }
  },
  toString(node, stringOthers) {
    return `(${stringOthers(node.content)})`;
  },
  traverse(node, fn, traverseOthers) {
    fn(node);
    traverseOthers(node.content, fn);
  },
  async map(node, fn, mapOthers) {
    const resultingNode = await fn(node);
    if (resultingNode === node) {
      node.content = await mapOthers(node.content, fn);
    }
    return resultingNode;
  },
}

export default parenthesis;
