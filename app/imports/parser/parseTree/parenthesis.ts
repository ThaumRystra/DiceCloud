import NodeFactory, { ResolveLevel } from '/imports/parser/parseTree/NodeFactory';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import resolve, { toString, traverse, map, Context, ResolvedResult } from '/imports/parser/resolve';

export type ParenthesisNode = {
  parseType: 'parenthesis';
  content: ParseNode;
}

interface ParenthesisFactory extends NodeFactory {
  create(node: Partial<ParenthesisNode>): ParenthesisNode;
  compile?: undefined;
  roll?: undefined;
  reduce?: undefined;
  resolve(
    fn: ResolveLevel, node: ParenthesisNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  toString(node: ParenthesisNode): string;
  traverse(node: ParenthesisNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  map(node: ParenthesisNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
}

const parenthesis: ParenthesisFactory = {
  create({ content }: { content: ParseNode }) {
    return {
      parseType: 'parenthesis',
      content,
    };
  },
  resolve(fn, node, scope, context) {
    const { result: content } = resolve(fn, node.content, scope, context);
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
  toString(node) {
    return `(${toString(node.content)})`;
  },
  traverse(node, fn: (node: ParseNode) => any) {
    fn(node);
    traverse(node.content, fn);
  },
  map(node, fn: (node: ParseNode) => any) {
    const resultingNode = fn(node);
    if (resultingNode === node) {
      node.content = map(node.content, fn);
    }
    return resultingNode;
  },
}

export default parenthesis;
