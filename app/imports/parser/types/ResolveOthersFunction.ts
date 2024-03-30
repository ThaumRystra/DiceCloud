import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import Context from '/imports/parser/types/Context';
import ResolveLevel from '/imports/parser/types/ResolveLevel';
import ResolvedResult from '/imports/parser/types/ResolvedResult';

type ResolveOthersFunction = (
  fn: ResolveLevel,
  node: ParseNode,
  scope: Record<string, any>,
  context: Context,
  inputProvider: InputProvider,
) => Promise<ResolvedResult>

export default ResolveOthersFunction;
