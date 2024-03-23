import walkDown from '/imports/api/engine/computation/utility/walkdown';
import { getEffectTagTargets } from '/imports/api/engine/computation/buildComputation/linkTypeDependencies';
import { Forest, TreeNode } from '/imports/api/parenting/parentingFunctions';
import { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureComputation from '/imports/api/engine/computation/CreatureComputation';

export default function computeToggleDependencies(
  node: TreeNode<CreatureProperty>, computation: CreatureComputation, forest: Forest<CreatureProperty>
) {
  const prop = node.doc
  // Only for toggles
  if (prop.type !== 'toggle') return;

  if (prop.targetByTags) {
    // Find all the props targeted by tags, and disable them and their children
    getEffectTagTargets(prop, computation).forEach(targetId => {
      const target = forest.nodeIndex[targetId];
      if (!target) return;
      target.doc._computationDetails.toggleAncestors.push(prop);
      computation.dependencyGraph.addLink(target.doc._id, prop._id, 'toggle');
      walkDown(target.children, child => {
        // The child nodes depend on the toggle
        child.doc._computationDetails.toggleAncestors.push(prop);
        computation.dependencyGraph.addLink(child.doc._id, prop._id, 'toggle');
      });
    });
  }

  // We don't need to link direct children of static toggles, it's already done
  if (prop.disabled || prop.enabled) return;

  walkDown(node.children, child => {
    // The child nodes depend on the toggle
    child.doc._computationDetails.toggleAncestors.push(prop);
    computation.dependencyGraph.addLink(child.doc._id, prop._id, 'toggle');
  });
}
