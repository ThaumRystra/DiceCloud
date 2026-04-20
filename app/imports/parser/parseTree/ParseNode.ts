import type { AccessorNode } from './accessor';
import type { ArrayNode } from './array';
import type { CallNode } from './call';
import type { ConstantNode } from './constant';
import type { ErrorNode } from './error';
import type { IfNode } from './if';
import type { IndexNode } from './indexNode';
import type { NotNode } from './not';
import type { OperatorNode } from './operator';
import type { ParenthesisNode } from './parenthesis';
import type { RollNode } from './roll';
import type { RollArrayNode } from './rollArray';
import type { UnaryOperatorNode } from './unaryOperator';

export type ParseNode = AccessorNode
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
