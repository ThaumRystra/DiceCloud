import DefaultTreeNode from '/imports/ui/properties/treeNodeViews/DefaultTreeNode.vue';
import AdjustmentTreeNode from '/imports/ui/properties/treeNodeViews/AdjustmentTreeNode.vue';
import ItemTreeNode from '/imports/ui/properties/treeNodeViews/ItemTreeNode.vue';
import DamageTreeNode from '/imports/ui/properties/treeNodeViews/DamageTreeNode.vue';
import EffectTreeNode from '/imports/ui/properties/treeNodeViews/EffectTreeNode.vue';

export default {
  default: DefaultTreeNode,
  adjustment: AdjustmentTreeNode,
  damage: DamageTreeNode,
  effect: EffectTreeNode,
  item: ItemTreeNode,
}
