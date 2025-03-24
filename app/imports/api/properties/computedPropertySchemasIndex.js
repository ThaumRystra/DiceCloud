import '/imports/api/simpleSchemaConfig';
import { ComputedActionSchema } from '/imports/api/properties/Actions';
import { ComputedAdjustmentSchema } from '/imports/api/properties/Adjustments';
import { ComputedAttributeSchema } from '/imports/api/properties/Attributes';
import { ComputedBuffSchema } from '/imports/api/properties/Buffs';
import { ComputedBuffRemoverSchema } from '/imports/api/properties/BuffRemovers';
import { ComputedBranchSchema } from '/imports/api/properties/Branches';
import { ComputedClassSchema } from '/imports/api/properties/Classes';
import { ComputedClassLevelSchema } from '/imports/api/properties/ClassLevels';
import { ConstantSchema } from '/imports/api/properties/Constants';
import { ComputedContainerSchema } from '/imports/api/properties/Containers';
import { ComputedCreatureTemplateSchema } from '/imports/api/properties/CreatureTemplates';
import { ComputedDamageSchema } from '/imports/api/properties/Damages';
import { DamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers';
import { ComputedEffectSchema } from '/imports/api/properties/Effects';
import { ComputedFeatureSchema } from '/imports/api/properties/Features';
import { ComputedFolderSchema } from '/imports/api/properties/Folders';
import { ComputedItemSchema } from '/imports/api/properties/Items';
import { ComputedNoteSchema } from '/imports/api/properties/Notes';
import { ComputedPointBuySchema } from '/imports/api/properties/PointBuys';
import { ProficiencySchema } from '/imports/api/properties/Proficiencies';
import { ReferenceSchema } from '/imports/api/properties/References';
import { ComputedRollSchema } from '/imports/api/properties/Rolls';
import { ComputedSavingThrowSchema } from '/imports/api/properties/SavingThrows';
import { ComputedSkillSchema } from '/imports/api/properties/Skills';
import { ComputedSlotSchema } from '/imports/api/properties/Slots';
import { ComputedSpellSchema } from '/imports/api/properties/Spells';
import { ComputedSpellListSchema } from '/imports/api/properties/SpellLists';
import { ComputedToggleSchema } from '/imports/api/properties/Toggles';
import { ComputedTriggerSchema } from '/imports/api/properties/Triggers';

const propertySchemasIndex = {
  action: ComputedActionSchema,
  adjustment: ComputedAdjustmentSchema,
  attribute: ComputedAttributeSchema,
  branch: ComputedBranchSchema,
  buff: ComputedBuffSchema,
  buffRemover: ComputedBuffRemoverSchema,
  class: ComputedClassSchema,
  classLevel: ComputedClassLevelSchema,
  constant: ConstantSchema,
  container: ComputedContainerSchema,
  creature: ComputedCreatureTemplateSchema,
  damage: ComputedDamageSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: ComputedEffectSchema,
  feature: ComputedFeatureSchema,
  folder: ComputedFolderSchema,
  item: ComputedItemSchema,
  note: ComputedNoteSchema,
  pointBuy: ComputedPointBuySchema,
  proficiency: ProficiencySchema,
  propertySlot: ComputedSlotSchema,
  reference: ReferenceSchema,
  roll: ComputedRollSchema,
  savingThrow: ComputedSavingThrowSchema,
  skill: ComputedSkillSchema,
  spell: ComputedSpellSchema,
  spellList: ComputedSpellListSchema,
  toggle: ComputedToggleSchema,
  trigger: ComputedTriggerSchema,
};

export default propertySchemasIndex;
