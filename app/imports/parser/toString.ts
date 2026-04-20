import factories from './parseTree';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';

export default function toString(node: ParseNode) {
  if (!node) return '';
  return factories[node.parseType].toString(node as any, toString);
}
