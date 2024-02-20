import ParseNode from '/imports/parser/parseTree/ParseNode';

type MapFunction<T extends ParseNode> = {
  (node: T, fn: (node: ParseNode) => Promise<ParseNode>, mapOthers: MapOthersFunction): Promise<ParseNode>;
}

export default MapFunction;

type MapOthersFunction = {
  (node: ParseNode, fn: (node: ParseNode) => Promise<ParseNode>): Promise<ParseNode>
}
