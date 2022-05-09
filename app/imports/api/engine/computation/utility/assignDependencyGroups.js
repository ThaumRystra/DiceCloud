import { union } from "lodash";

export function assignDependencyGroups(graph) {
  console.log('assigning dep group ids');
  graph.forEachLink(function (link) {
    console.dir(link);
  });
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
      if (top.data?._id && (
        lowestOrderId === undefined ||
        top.data?.order < lowestOrder
      )) {
        lowestOrderId = top.data._id;
        lowestOrder = top.data.order;
      }
      group.push(top)
      top._depGroupVisited = true;
      graph.forEachLinkedNode(top.id, linkedNode => stack.push(linkedNode));
    }
    // Assign group id
    group.forEach(node => {
      if (!node.data?._id) return;
      if (group.length > 1) {
        node.data.depGroupId = lowestOrderId;
      } else {
        delete node.data.depGroupId;
      }
    });
  });
}


export default function assignDependencyGroups2(graph) {
  const groups = new Set();
  graph.forEachLink(function (link) {
    const from = graph.getNode(link.fromId);
    const to = graph.getNode(link.toId);
    let depGroup;
    if (from._depGroup) {
      depGroup = from._depGroup;
      groups.delete(to._depGroup);
    } else if (to._depGroup) {
      depGroup = to._depGroup;
    } else {
      depGroup = {};
      groups.add(depGroup);
    }
    depGroup.nodes = union(from._depGroup?.nodes, to._depGroup?.nodes, [from, to])
    from._depGroup = depGroup;
    to._depGroup = depGroup;
  });
  groups.forEach(g => {
    if (!g.nodes.length) return;
    const rootId = g.nodes[0].id;
    g.nodes.forEach(n => {
      if (!n.data?._id) return;
      n.data.depGroupId = rootId;
    });
  });
}
