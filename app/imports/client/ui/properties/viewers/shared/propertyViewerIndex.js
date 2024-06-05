import ActionViewer from '/imports/client/ui/properties/viewers/ActionViewer.vue';
import AdjustmentViewer from '/imports/client/ui/properties/viewers/AdjustmentViewer.vue';
import AttributeViewer from '/imports/client/ui/properties/viewers/AttributeViewer.vue';
import BuffViewer from '/imports/client/ui/properties/viewers/BuffViewer.vue';
import BuffRemoverViewer from '/imports/client/ui/properties/viewers/BuffRemoverViewer.vue';
import BranchViewer from '/imports/client/ui/properties/viewers/BranchViewer.vue';
import ContainerViewer from '/imports/client/ui/properties/viewers/ContainerViewer.vue';
import ClassViewer from '/imports/client/ui/properties/viewers/ClassViewer.vue';
import ClassLevelViewer from '/imports/client/ui/properties/viewers/ClassLevelViewer.vue';
import ConstantViewer from '/imports/client/ui/properties/viewers/ConstantViewer.vue';
import CreatureTemplateViewer from '/imports/client/ui/properties/viewers/CreatureTemplateViewer.vue';
import DamageViewer from '/imports/client/ui/properties/viewers/DamageViewer.vue';
import DamageMultiplierViewer from '/imports/client/ui/properties/viewers/DamageMultiplierViewer.vue';
import EffectViewer from '/imports/client/ui/properties/viewers/EffectViewer.vue';
import FeatureViewer from '/imports/client/ui/properties/viewers/FeatureViewer.vue';
import FolderViewer from '/imports/client/ui/properties/viewers/FolderViewer.vue';
import ItemViewer from '/imports/client/ui/properties/viewers/ItemViewer.vue';
import NoteViewer from '/imports/client/ui/properties/viewers/NoteViewer.vue';
import PointBuyViewer from '/imports/client/ui/properties/viewers/PointBuyViewer.vue';
import ProficiencyViewer from '/imports/client/ui/properties/viewers/ProficiencyViewer.vue';
import ReferenceViewer from '/imports/client/ui/properties/viewers/ReferenceViewer.vue';
import RollViewer from '/imports/client/ui/properties/viewers/RollViewer.vue';
import SkillViewer from '/imports/client/ui/properties/viewers/SkillViewer.vue';
import SavingThrowViewer from '/imports/client/ui/properties/viewers/SavingThrowViewer.vue';
import SlotViewer from '/imports/client/ui/properties/viewers/SlotViewer.vue';
import SpellListViewer from '/imports/client/ui/properties/viewers/SpellListViewer.vue';
import SpellViewer from '/imports/client/ui/properties/viewers/SpellViewer.vue';
import ToggleViewer from '/imports/client/ui/properties/viewers/ToggleViewer.vue';
import TriggerViewer from '/imports/client/ui/properties/viewers/TriggerViewer.vue';

export default {
  action: ActionViewer,
  adjustment: AdjustmentViewer,
  attribute: AttributeViewer,
  buff: BuffViewer,
  buffRemover: BuffRemoverViewer,
  branch: BranchViewer,
  container: ContainerViewer,
  class: ClassViewer,
  classLevel: ClassLevelViewer,
  constant: ConstantViewer,
  creature: CreatureTemplateViewer,
  damage: DamageViewer,
  damageMultiplier: DamageMultiplierViewer,
  effect: EffectViewer,
  feature: FeatureViewer,
  folder: FolderViewer,
  item: ItemViewer,
  note: NoteViewer,
  pointBuy: PointBuyViewer,
  proficiency: ProficiencyViewer,
  propertySlot: SlotViewer,
  roll: RollViewer,
  reference: ReferenceViewer,
  savingThrow: SavingThrowViewer,
  skill: SkillViewer,
  spellList: SpellListViewer,
  spell: SpellViewer,
  toggle: ToggleViewer,
  trigger: TriggerViewer,
};
