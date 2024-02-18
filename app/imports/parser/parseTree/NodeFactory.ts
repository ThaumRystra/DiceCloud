import { ParseNode } from '/imports/parser/parser';
import { ResolvedResult, Context } from '/imports/parser/resolve';

export type ResolveLevel = 'compile' | 'roll' | 'reduce';

export default interface NodeFactory {
  create(node: Partial<ParseNode>): ParseNode;

  compile?(
    node: ParseNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;

  roll?(
    node: ParseNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;

  reduce?(
    node: ParseNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;

  resolve?(
    fn: ResolveLevel, node: ParseNode, scope: Record<string, any>, context: Context
  ): ResolvedResult;

  toString(node: ParseNode): string;
  traverse?(node: ParseNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
  map?(node: ParseNode, fn: (node: ParseNode) => any): ReturnType<typeof fn>;
}
