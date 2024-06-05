import SimpleSchema from 'simpl-schema';
import { ActionSchema } from '/imports/api/properties/Actions';
import { AdjustmentSchema } from '/imports/api/properties/Adjustments';
import { AttributeSchema } from '/imports/api/properties/Attributes';
import { BranchSchema } from '/imports/api/properties/Branches';
import { BuffRemoverSchema } from '/imports/api/properties/BuffRemovers';
import { BuffSchema } from '/imports/api/properties/Buffs';
import { ClassLevelSchema } from '/imports/api/properties/ClassLevels';
import { ClassSchema } from '/imports/api/properties/Classes';
import { ConstantSchema } from '/imports/api/properties/Constants';
import { ContainerSchema } from '/imports/api/properties/Containers';
import { CreatureTemplateSchema } from '/imports/api/properties/CreatureTemplates';
import { DamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers';
import { DamageSchema } from '/imports/api/properties/Damages';
import { EffectSchema } from '/imports/api/properties/Effects';
import { FeatureSchema } from '/imports/api/properties/Features';
import { FolderSchema } from '/imports/api/properties/Folders';
import { ItemSchema } from '/imports/api/properties/Items';
import { NoteSchema } from '/imports/api/properties/Notes';
import { PointBuySchema } from '/imports/api/properties/PointBuys';
import { ProficiencySchema } from '/imports/api/properties/Proficiencies';
import { ReferenceSchema } from '/imports/api/properties/References';
import { RollSchema } from '/imports/api/properties/Rolls';
import { SavingThrowSchema } from '/imports/api/properties/SavingThrows';
import { SkillSchema } from '/imports/api/properties/Skills';
import { SlotSchema } from '/imports/api/properties/Slots';
import { SpellListSchema } from '/imports/api/properties/SpellLists';
import { SpellSchema } from '/imports/api/properties/Spells';
import { ToggleSchema } from '/imports/api/properties/Toggles';
import { TriggerSchema } from '/imports/api/properties/Triggers';

const propertySchemasIndex = {
  action: ActionSchema,
  adjustment: AdjustmentSchema,
  attribute: AttributeSchema,
  branch: BranchSchema,
  buff: BuffSchema,
  buffRemover: BuffRemoverSchema,
  class: ClassSchema,
  classLevel: ClassLevelSchema,
  constant: ConstantSchema,
  container: ContainerSchema,
  creature: CreatureTemplateSchema,
  damage: DamageSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: EffectSchema,
  feature: FeatureSchema,
  folder: FolderSchema,
  item: ItemSchema,
  note: NoteSchema,
  pointBuy: PointBuySchema,
  proficiency: ProficiencySchema,
  propertySlot: SlotSchema,
  reference: ReferenceSchema,
  roll: RollSchema,
  savingThrow: SavingThrowSchema,
  skill: SkillSchema,
  spell: SpellSchema,
  spellList: SpellListSchema,
  toggle: ToggleSchema,
  trigger: TriggerSchema,
  any: new SimpleSchema({}),
};

export default propertySchemasIndex;
