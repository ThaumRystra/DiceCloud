import type Context from './Context';
import type { ResolvedResult } from './ResolvedResult';
import type { ResolveLevel } from './ResolveLevel';
import type { ResolveOthersFunction } from './ResolveOthersFunction';
import type { InputProvider } from '/imports/api/engine/action/functions/userInput/InputProvider';
import type { Variables } from '/imports/api/engine/computation/CreatureComputation';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';

export type ResolveFunction<T extends ParseNode> = (
  fn: ResolveLevel,
  node: T,
  scope: Variables,
  context: Context,
  input: InputProvider,
  resolveOthers: ResolveOthersFunction,
) => Promise<ResolvedResult>;


