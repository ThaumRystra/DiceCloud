<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { getFilter, docsToForest } from '/imports/api/parenting/parentingFunctions';
import BuildTreeNodeList from '/imports/client/ui/creature/buildTree/BuildTreeNodeList.vue';

const props = defineProps<{
  model: Record<string, any>;
}>();

function traverse(tree: any[], callback: (node: any, parents: any[]) => void, parents: any[] = []) {
  tree.forEach(node => {
    callback(node, parents);
    traverse(node.children, callback, [...parents, node]);
  });
}

const { result: slotBuildTree } = autorun(() => {
  const slots = CreatureProperties.find({
    $and: [{
      $or: [
        { ...getFilter.descendants(props.model) },
        { '_id': props.model._id },
      ],
    }, {
      $or: [
        { 'slotCondition.value': { $nin: [false, 0, ''] } },
        { 'slotCondition.value': { $exists: false } },
        { 'slotCondition': { $exists: false } },
      ],
    }],
    type: { $in: ['propertySlot', 'pointBuy'] },
    removed: { $ne: true },
    inactive: { $ne: true },
  }, {
    sort: { left: 1 },
  });
  const slotIds = slots.map((s: any) => s._id);
  const slotChildren = CreatureProperties.find({
    'parentId': { $in: slotIds },
    removed: { $ne: true },
  }, {
    sort: { left: 1 },
  });
  const tree = docsToForest([
    ...slots.fetch(),
    ...slotChildren.fetch(),
  ]);
  traverse(tree, (child, parents) => {
    const nodeModel = child.doc;
    const isSlotWithSpace = nodeModel.type === 'propertySlot' && (
      nodeModel.spaceLeft > 0 ||
      !nodeModel.quantityExpected ||
      nodeModel.quantityExpected.value === 0
    );
    if (isSlotWithSpace) {
      nodeModel._canFill = true;
      parents.forEach((node: any) => {
        node.doc._descendantCanFill = true;
      });
    }
  });
  return tree;
});
</script>

<template>
  <build-tree-node-list
    :children="slotBuildTree"
    class="mx-2"
    @selected="_id => $emit('sub-click', _id)"
  />
</template>
