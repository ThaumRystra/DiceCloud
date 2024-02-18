import NodeFactory from '/imports/parser/parseTree/NodeFactory';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import { Context, ResolvedResult } from '/imports/parser/resolve';

export type ErrorNode = {
  parseType: 'error';
  node: ParseNode;
  error: string;
}

interface ErrorFactory extends NodeFactory {
  create(node: Partial<ErrorNode>): ErrorNode;
  compile(
    node: ErrorNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;
  roll?: undefined;
  reduce?: undefined;
  resolve?: undefined;
  toString(node: ErrorNode): string;
  traverse?: undefined;
  map?: undefined;
}

const error: ErrorFactory = {
  create({ node, error }: { node: ParseNode, error: string }) {
    return {
      parseType: 'error',
      node,
      error,
    }
  },
  compile(node, scope, context) {
    return { result: node, context };
  },
  toString(node) {
    return node.error;
  },
}

export default error;
