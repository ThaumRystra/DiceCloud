import type { InputProvider } from '/imports/api/engine/action/functions/userInput/InputProvider';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import type Context from './Context';
import type { ResolvedResult } from './ResolvedResult';
import type { ResolveOthersFunction } from './ResolveOthersFunction';
import type { Variables } from '/imports/api/engine/computation/CreatureComputation';

export type ResolveLevelFunction<T extends ParseNode> = (
  node: T,
  scope: Variables,
  context: Context,
  input: InputProvider,
  resolveOthers: ResolveOthersFunction,
) => Promise<ResolvedResult>;
