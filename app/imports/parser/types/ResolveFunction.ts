import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import Context from './Context';
import ResolvedResult from './ResolvedResult';
import ResolveLevel from './ResolveLevel';
import ResolveOthersFunction from './ResolveOthersFunction';

type ResolveFunction<T extends ParseNode> = (
  fn: ResolveLevel,
  node: T,
  scope: Record<string, any>,
  context: Context,
  input: InputProvider,
  resolveOthers: ResolveOthersFunction,
) => Promise<ResolvedResult>;

export default ResolveFunction;

