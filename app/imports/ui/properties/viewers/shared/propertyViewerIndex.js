const ActionViewer = () => import ('/imports/ui/properties/viewers/ActionViewer.vue');
const AdjustmentViewer = () => import ('/imports/ui/properties/viewers/AdjustmentViewer.vue');
const AttributeViewer = () => import ('/imports/ui/properties/viewers/AttributeViewer.vue');
const BuffViewer = () => import ('/imports/ui/properties/viewers/BuffViewer.vue');
const BranchViewer = () => import ('/imports/ui/properties/viewers/BranchViewer.vue');
const ContainerViewer = () => import ('/imports/ui/properties/viewers/ContainerViewer.vue');
const ClassLevelViewer = () => import ('/imports/ui/properties/viewers/ClassLevelViewer.vue');
const ConstantViewer = () => import ('/imports/ui/properties/viewers/ConstantViewer.vue');
const DamageViewer = () => import ('/imports/ui/properties/viewers/DamageViewer.vue');
const DamageMultiplierViewer = () => import ('/imports/ui/properties/viewers/DamageMultiplierViewer.vue');
const EffectViewer = () => import ('/imports/ui/properties/viewers/EffectViewer.vue');
const FeatureViewer = () => import ('/imports/ui/properties/viewers/FeatureViewer.vue');
const FolderViewer = () => import ('/imports/ui/properties/viewers/FolderViewer.vue');
const ItemViewer = () => import ('/imports/ui/properties/viewers/ItemViewer.vue');
const NoteViewer = () => import ('/imports/ui/properties/viewers/NoteViewer.vue');
const ProficiencyViewer = () => import ('/imports/ui/properties/viewers/ProficiencyViewer.vue');
const ReferenceViewer = () => import ('/imports/ui/properties/viewers/ReferenceViewer.vue');
const RollViewer = () => import ('/imports/ui/properties/viewers/RollViewer.vue');
const SkillViewer = () => import ('/imports/ui/properties/viewers/SkillViewer.vue');
const SavingThrowViewer = () => import ('/imports/ui/properties/viewers/SavingThrowViewer.vue');
const SlotViewer = () => import ('/imports/ui/properties/viewers/SlotViewer.vue');
const SlotFillerViewer = () => import ('/imports/ui/properties/viewers/SlotFillerViewer.vue');
const SpellListViewer = () => import ('/imports/ui/properties/viewers/SpellListViewer.vue');
const SpellViewer = () => import ('/imports/ui/properties/viewers/SpellViewer.vue');
const ToggleViewer = () => import ('/imports/ui/properties/viewers/ToggleViewer.vue');

export default {
  action: ActionViewer,
  adjustment: AdjustmentViewer,
  attribute: AttributeViewer,
  buff: BuffViewer,
  branch: BranchViewer,
  container: ContainerViewer,
  class: SlotViewer,
  classLevel: ClassLevelViewer,
  constant: ConstantViewer,
  damage: DamageViewer,
  damageMultiplier: DamageMultiplierViewer,
  effect: EffectViewer,
  feature: FeatureViewer,
  folder: FolderViewer,
  item: ItemViewer,
  note: NoteViewer,
  proficiency: ProficiencyViewer,
  propertySlot: SlotViewer,
  roll: RollViewer,
  reference: ReferenceViewer,
  savingThrow: SavingThrowViewer,
  slotFiller: SlotFillerViewer,
  skill: SkillViewer,
  spellList: SpellListViewer,
  spell: SpellViewer,
  toggle: ToggleViewer,
};
