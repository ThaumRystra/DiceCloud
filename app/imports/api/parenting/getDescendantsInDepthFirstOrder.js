import { nodesToTree } from '/imports/api/parenting/parenting.js';

export default function getDescendantsInDepthFirstOrder({
  collection,
  ancestorId,
  filter,
  options = {fields: {order: 1, ancestors: 1}},
}){
  let forest = nodesToTree({collection, ancestorId, filter, options});
  let orderMemo = getDocsInDepthFirstOrder(forest);
  return orderMemo;
}

export function getDocsInDepthFirstOrder(forest){
  let docs = [];
  forest.forEach(node => {
    addNodeAndTraverse(node, docs)
  });
  return docs;
}

function addNodeAndTraverse(node, docs){
  docs.push(node.node);
  node.children.forEach(child => {
    addNodeAndTraverse(child, docs)
  });
}
