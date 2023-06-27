<template>
  <build-tree-node-list
    :children="slotBuildTree"
    class="mx-2"
    @selected="_id => $emit('sub-click', _id)"
  />
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import BuildTreeNodeList from '/imports/client/ui/creature/buildTree/BuildTreeNodeList.vue';

function traverse(tree, callback, parents = []){
  tree.forEach(node => {
    callback(node, parents);
    traverse(node.children, callback, [...parents, node]);
  });
}

export default {
  components: {
    BuildTreeNodeList,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  meteor: {
    slotBuildTree() {
      const slots = CreatureProperties.find({
        $and: [ {
          $or: [
            { 'ancestors.id': this.model._id, },
            { '_id': this.model._id, },
          ],
        }, {
          $or:
            [
            { 'slotCondition.value': { $nin: [false, 0, ''] } },
            { 'slotCondition.value': { $exists: false } },
            { 'slotCondition': { $exists: false } },
            ],
        } ],
        type: { $in: ['propertySlot', 'pointBuy'] },
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { order: 1 }
      });
      const slotIds = slots.map(s => s._id);
      const slotChildren = CreatureProperties.find({
        'parent.id': { $in: slotIds },
        removed: { $ne: true },
      }, {
        sort: { order: 1 },
      });
      const tree = nodeArrayToTree([
        ...slots.fetch(),
        ...slotChildren.fetch()
      ]);
      traverse(tree, (child, parents) => {
        const model = child.node;
        const isSlotWithSpace = model.type === 'propertySlot' && (
          model.spaceLeft > 0 ||
          !model.quantityExpected ||
          model.quantityExpected.value === 0
        );
        if (isSlotWithSpace) {
          model._canFill = true;
          parents.forEach(node => {
            node.node._descendantCanFill = true;
          });
        }
      });
      return tree;
    },
  }
}
</script>