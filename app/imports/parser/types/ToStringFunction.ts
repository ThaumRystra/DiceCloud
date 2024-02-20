import ParseNode from '/imports/parser/parseTree/ParseNode';

type ToStringFunction<T extends ParseNode> = {
  (node: T, stringOthers: ToStringOthersFunction): string;
}

export default ToStringFunction;

type ToStringOthersFunction = {
  (node: ParseNode): string;
}
