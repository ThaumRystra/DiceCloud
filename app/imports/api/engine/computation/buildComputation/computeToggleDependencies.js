import walkDown from '/imports/api/engine/computation/utility/walkdown.js';

export default function computeToggleDependencies(node, dependencyGraph){
  const prop = node.node;
  // Only for toggles that aren't inactive and aren't set to enabled or disabled
  if (
    prop.inactive ||
    prop.type !== 'toggle' ||
    prop.disabled ||
    prop.enabled
  ) return;
  walkDown(node.children, child => {
    // Only for children that aren't inactive
    if (child.node.inactive) return;
    // The child nodes depend on the toggle condition compuation
    child.node._computationDetails.toggleAncestors.push(prop);
    dependencyGraph.addLink(child.node._id, prop._id, 'toggle');
  });
}
