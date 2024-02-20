import ParseNode from '/imports/parser/parseTree/ParseNode';
import Context from './Context';

type ResolvedResult = {
  result: ParseNode;
  context: Context;
};

export default ResolvedResult;
