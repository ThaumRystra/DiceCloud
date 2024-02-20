import ParseNode from '/imports/parser/parseTree/ParseNode';
import { ConstantValueType } from '/imports/parser/parseTree/constant';
import toString from './toString';


export default function toPrimitiveOrString(node: ParseNode): ConstantValueType {
  if (!node) return '';
  if (node.parseType === 'constant') return node.value;
  if (node.parseType === 'error') return undefined;
  return toString(node);
}
