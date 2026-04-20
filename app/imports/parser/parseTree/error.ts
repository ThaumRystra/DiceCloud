import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { ResolveLevelFunction } from '/imports/parser/types/ResolveLevelFunction';
import type { ToStringFunction } from '/imports/parser/types/ToStringFunction';

export type ErrorNode = {
  parseType: 'error';
  node: ParseNode;
  error: string;
}

interface ErrorFactory {
  create(node: Partial<ErrorNode>): ErrorNode;
  compile: ResolveLevelFunction<ErrorNode>;
  toString: ToStringFunction<ErrorNode>;
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
}

export default error;
