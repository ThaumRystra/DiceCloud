import nodeTypeIndex from './parseTree';
import ParseNode from '/imports/parser/parseTree/ParseNode';

export default async function map(node: ParseNode, fn: (ParseNode) => Promise<any>): Promise<any> {
  if (!node) return;
  const type = nodeTypeIndex[node.parseType];
  if (!type) {
    console.error(node);
    throw new Meteor.Error('Not valid parse node');
  }
  if ('map' in type) {
    return type.map(node as any, fn, map);
  }
  return fn(node);
}
