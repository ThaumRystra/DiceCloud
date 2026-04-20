import type { ParseNode } from '/imports/parser/parseTree/ParseNode';

export type MapFunction<T extends ParseNode> = {
  (node: T, fn: (node: ParseNode) => Promise<ParseNode>, mapOthers: MapOthersFunction): Promise<ParseNode>;
}


type MapOthersFunction = {
  (node: ParseNode, fn: (node: ParseNode) => Promise<ParseNode>): Promise<ParseNode>
}
