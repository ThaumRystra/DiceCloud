import DefaultTreeNode from '/imports/client/ui/properties/treeNodeViews/DefaultTreeNode.vue';
import AdjustmentTreeNode from '/imports/client/ui/properties/treeNodeViews/AdjustmentTreeNode.vue';
import BranchTreeNode from '/imports/client/ui/properties/treeNodeViews/BranchTreeNode.vue';
import ItemTreeNode from '/imports/client/ui/properties/treeNodeViews/ItemTreeNode.vue';
import DamageTreeNode from '/imports/client/ui/properties/treeNodeViews/DamageTreeNode.vue';
import EffectTreeNode from '/imports/client/ui/properties/treeNodeViews/EffectTreeNode.vue';
import ClassLevelTreeNode from '/imports/client/ui/properties/treeNodeViews/ClassLevelTreeNode.vue';
import ProficiencyTreeNode from '/imports/client/ui/properties/treeNodeViews/ProficiencyTreeNode.vue';
import ReferenceTreeNode from '/imports/client/ui/properties/treeNodeViews/ReferenceTreeNode.vue';
import SavingThrowTreeNode from '/imports/client/ui/properties/treeNodeViews/SavingThrowTreeNode.vue';

export default {
  default: DefaultTreeNode,
  adjustment: AdjustmentTreeNode,
  branch: BranchTreeNode,
  classLevel: ClassLevelTreeNode,
  damage: DamageTreeNode,
  effect: EffectTreeNode,
  item: ItemTreeNode,
  proficiency: ProficiencyTreeNode,
  reference: ReferenceTreeNode,
  savingThrow: SavingThrowTreeNode,
}
