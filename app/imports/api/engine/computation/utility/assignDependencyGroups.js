export default function assignDependencyGroups(graph) {
  // Iterate through all the nodes
  graph.forEachNode(node => {
    if (node._depGroupVisited) {
      return;
    }

    // DFS all the connected nodes to this node, mark visited, put in a group,
    // store the lowest ordered id
    const group = [];
    const stack = [node];
    let top, lowestOrderId, lowestOrder;
    while (stack.length) {
      top = stack.pop();
      if (top._depGroupVisited) continue;
      if (
        (lowestOrderId === undefined && top.data?._id) ||
        (top.data?._id && top.data?.order < lowestOrder)
      ) {
        lowestOrderId = top.data?._id;
        lowestOrder = top.data?.order;
      }
      if (top.data?._id) {
        group.push(top)
      }
      top._depGroupVisited = true;
      graph.forEachLinkedNode(top.id, linkedNode => stack.push(linkedNode));
    }
    // Assign group id
    group.forEach(node => {
      if (!lowestOrderId) return;
      if (group.length > 1) {
        node.data.depGroupId = lowestOrderId;
      } else {
        delete node.data.depGroupId;
      }
    });
  });
}