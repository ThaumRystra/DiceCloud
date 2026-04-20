import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type Context from './Context';

export type ResolvedResult = {
  result: ParseNode;
  context: Context;
};
