import nodeTypeIndex from './parseTree';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';

export default async function map(node: ParseNode, fn: (p: ParseNode) => Promise<ParseNode>): Promise<ParseNode> {
  if (!node) return node;
  const type = nodeTypeIndex[node.parseType];
  if (!type) {
    console.error(node);
    throw new Meteor.Error('Not valid parse node');
  }
  if ('map' in type) {
    return type.map(node as never, fn, map);
  }
  return fn(node);
}
