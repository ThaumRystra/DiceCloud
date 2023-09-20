import { getPropertyDecendants } from '/imports/api/engine/loadCreatures.js';
import applyProperty from '../applyProperty.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import { adjustQuantityWork } from '/imports/api/creature/creatureProperties/methods/adjustQuantity.js';

export default function applyItemAsAmmo(node, actionContext) {
  // The item node should come without children, since it is not part of the original action tree
  const prop = node.node;
  // Get all the item's descendant properties
  const properties = getPropertyDecendants(actionContext.creature._id, prop._id);
  properties.sort((a, b) => a.order - b.order);
  const propertyForest = nodeArrayToTree(properties);

  // Apply the item
  applyNodeTriggers(node, 'before', actionContext);

  // Do the quantity adjustment
  const itemProp = { ...prop, type: 'item' };
  delete itemProp.adjustment;
  adjustQuantityWork({
    property: itemProp,
    operation: 'increment',
    value: prop.adjustment,
  });

  // Simulate the change to quantity
  prop.quantity -= prop.adjustment;

  // Log the item name as a heading if it's not silent and has child properties to apply
  if (!prop.silent && propertyForest.length) {
    actionContext.addLog({
      name: prop.name || 'Ammo',
      inline: false,
    });
  }
  applyNodeTriggers(node, 'after', actionContext);

  // Apply the item's children
  propertyForest.forEach(node => applyProperty(node, actionContext));
  applyNodeTriggers(node, 'afterChildren', actionContext);
}
