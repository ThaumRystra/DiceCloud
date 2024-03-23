import { TreeDoc } from '/imports/api/parenting/ChildSchema';
import { TreeNode } from '/imports/api/parenting/parentingFunctions';

export default function walkDown<T extends TreeDoc>(
  trees: TreeNode<T>[], callback: (node: TreeNode<T>, stack: TreeNode<T>[]) => any
) {
  const stack = [...trees];
  while (stack.length) {
    const node = stack.pop();
    if (!node) return;
    callback(node, stack);
    stack.push(...node.children);
  }
}
