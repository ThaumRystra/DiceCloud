import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type { MapFunction } from '/imports/parser/types/MapFunction';
import type { ToStringFunction } from '/imports/parser/types/ToStringFunction';

export interface ParseNodeFactory<T extends ParseNode, U = Omit<T, 'parseType'>> {
  create(node: U): T;
  toString: ToStringFunction<T>;
  traverse: TraverseFunction<T>;
  map: MapFunction<T>;
}

export type TraverseFunction<T extends ParseNode> = {
  (
    node: T,
    fn: (node: ParseNode) => void,
    traverseOthers: (node: ParseNode, fn: (node: ParseNode) => void) => void,
  ): void;
}
