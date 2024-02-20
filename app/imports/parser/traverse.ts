/* eslint-disable no-fallthrough */
import factories from './parseTree';
import ParseNode from '/imports/parser/parseTree/ParseNode';

export default function traverse(node: ParseNode, fn: (ParseNode) => any): ReturnType<typeof fn> {
  if (!node) return;
  const factory = factories[node.parseType];
  if ('traverse' in factory) {
    return factory.traverse(node as any, fn, traverse);
  }
  return fn(node);
}
