import type { ParseNode } from '/imports/parser/parseTree/ParseNode';

export type ToStringFunction<T extends ParseNode> = {
  (node: T, stringOthers: ToStringOthersFunction): string;
}

type ToStringOthersFunction = {
  (node: ParseNode): string;
}
