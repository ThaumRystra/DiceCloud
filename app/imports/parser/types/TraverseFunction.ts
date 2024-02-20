import ParseNode from '/imports/parser/parseTree/ParseNode';

type TraverseFunction<T extends ParseNode> = {
  (
    node: T,
    fn: (node: ParseNode) => any,
    traverseOthers: TraverseOthersFunction
  ): any;
}

export default TraverseFunction;

type TraverseOthersFunction = {
  (node: ParseNode, fn: (node: ParseNode) => any): any
}
