import walkDown from '/imports/api/engine/computation/utility/walkdown.js';
import { getEffectTagTargets } from '/imports/api/engine/computation/buildComputation/linkTypeDependencies.js';

export default function computeToggleDependencies(node, dependencyGraph, computation, forest) {
  const prop = node.node;
  // Only for toggles
  if (prop.type !== 'toggle') return;

  if (prop.targetByTags) {
    // Find all the props targeted by tags, and disable them and their children
    getEffectTagTargets(prop, computation).forEach(targetId => {
      const target = forest.nodeIndex[targetId];
      if (!target) return;
      target.node._computationDetails.toggleAncestors.push(prop);
      dependencyGraph.addLink(target.node._id, prop._id, 'toggle');
      walkDown(target.children, child => {
        // The child nodes depend on the toggle
        child.node._computationDetails.toggleAncestors.push(prop);
        dependencyGraph.addLink(child.node._id, prop._id, 'toggle');
      });
    });
  }

  // We don't need to link direct children of static toggles, it's already done
  if (prop.disabled || prop.enabled) return;

  walkDown(node.children, child => {
    // The child nodes depend on the toggle
    child.node._computationDetails.toggleAncestors.push(prop);
    dependencyGraph.addLink(child.node._id, prop._id, 'toggle');
  });
}
