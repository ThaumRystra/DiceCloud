import { AccessorNode } from './accessor';
import { ArrayNode } from './array';
import { CallNode } from './call';
import { ConstantNode } from './constant';
import { ErrorNode } from './error';
import { IfNode } from './if';
import { IndexNode } from './indexNode';
import { NotNode } from './not';
import { OperatorNode } from './operator';
import { ParenthesisNode } from './parenthesis';
import { RollNode } from './roll';
import { RollArrayNode } from './rollArray';
import { UnaryOperatorNode } from './unaryOperator';

type ParseNode = AccessorNode
  | ArrayNode
  | CallNode
  | ConstantNode
  | ErrorNode
  | IfNode
  | IndexNode
  | NotNode
  | OperatorNode
  | ParenthesisNode
  | RollNode
  | RollArrayNode
  | UnaryOperatorNode

export default ParseNode;