import type { ParseNode } from '/imports/parser/parseTree/ParseNode';

export type TraverseFunction<T extends ParseNode> = {
  (
    node: T,
    fn: (node: ParseNode) => unknown,
    traverseOthers: TraverseOthersFunction
  ): unknown;
}

type TraverseOthersFunction = {
  (node: ParseNode, fn: (node: ParseNode) => unknown): unknown
}
