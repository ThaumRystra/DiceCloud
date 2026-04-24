import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { ResolveLevelFunction } from '/imports/parser/types/ResolveLevelFunction';
import type { ParseNodeFactory } from '/imports/parser/types/ParseNodeFactory';

export type ErrorNode = {
  parseType: 'error';
  node: ParseNode;
  error: string;
}

type ErrorFactory = ParseNodeFactory<ErrorNode> & {
  compile: ResolveLevelFunction<ErrorNode>;
}

const error: ErrorFactory = {
  create({ node, error }: { node: ParseNode, error: string }) {
    return {
      parseType: 'error',
      node,
      error,
    }
  },
  async compile(node, scope, context) {
    return Promise.resolve({ result: node, context });
  },
  toString(node) {
    return node.error;
  },
  traverse(node, fn) {
    return fn(node);
  },
  map(node, fn) {
    return fn(node);
  }
}

export default error;
