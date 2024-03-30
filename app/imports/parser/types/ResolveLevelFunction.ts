import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import Context from './Context';
import ResolvedResult from './ResolvedResult';
import ResolveOthersFunction from './ResolveOthersFunction';

type ResolveLevelFunction<T extends ParseNode> = (
  node: T,
  scope: Record<string, any>,
  context: Context,
  input: InputProvider,
  resolveOthers: ResolveOthersFunction,
) => Promise<ResolvedResult>;

export default ResolveLevelFunction;
