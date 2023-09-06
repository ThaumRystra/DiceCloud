import SimpleSchema from 'simpl-schema';
import { ComputedActionSchema } from '/imports/api/properties/Actions.js';
import { ComputedAdjustmentSchema } from '/imports/api/properties/Adjustments.js';
import { ComputedAttributeSchema } from '/imports/api/properties/Attributes.js';
import { ComputedBuffSchema } from '/imports/api/properties/Buffs.js';
import { ComputedBuffRemoverSchema } from '/imports/api/properties/BuffRemovers.js';
import { ComputedBranchSchema } from '/imports/api/properties/Branches.js';
import { ComputedClassSchema } from '/imports/api/properties/Classes.js';
import { ComputedClassLevelSchema } from '/imports/api/properties/ClassLevels.js';
import { ConstantSchema } from '/imports/api/properties/Constants.js';
import { ComputedContainerSchema } from '/imports/api/properties/Containers.js';
import { ComputedDamageSchema } from '/imports/api/properties/Damages.js';
import { DamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers.js';
import { ComputedEffectSchema } from '/imports/api/properties/Effects.js';
import { ComputedFeatureSchema } from '/imports/api/properties/Features.js';
import { ComputedFolderSchema } from '/imports/api/properties/Folders.js';
import { ComputedItemSchema } from '/imports/api/properties/Items.js';
import { ComputedNoteSchema } from '/imports/api/properties/Notes.js';
import { ComputedPointBuySchema } from '/imports/api/properties/PointBuys.js';
import { ProficiencySchema } from '/imports/api/properties/Proficiencies.js';
import { ReferenceSchema } from '/imports/api/properties/References.js';
import { ComputedRollSchema } from '/imports/api/properties/Rolls.js';
import { ComputedSavingThrowSchema } from '/imports/api/properties/SavingThrows.js';
import { ComputedSkillSchema } from '/imports/api/properties/Skills.js';
import { ComputedSlotSchema } from '/imports/api/properties/Slots.js';
import { ComputedSpellSchema } from '/imports/api/properties/Spells.js';
import { ComputedSpellListSchema } from '/imports/api/properties/SpellLists.js';
import { ComputedToggleSchema } from '/imports/api/properties/Toggles.js';
import { ComputedTriggerSchema } from '/imports/api/properties/Triggers.js';

const propertySchemasIndex = {
  action: ComputedActionSchema,
  adjustment: ComputedAdjustmentSchema,
  attribute: ComputedAttributeSchema,
  buff: ComputedBuffSchema,
  buffRemover: ComputedBuffRemoverSchema,
  branch: ComputedBranchSchema,
  class: ComputedClassSchema,
  classLevel: ComputedClassLevelSchema,
  constant: ConstantSchema,
  damage: ComputedDamageSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: ComputedEffectSchema,
  feature: ComputedFeatureSchema,
  folder: ComputedFolderSchema,
  note: ComputedNoteSchema,
  pointBuy: ComputedPointBuySchema,
  proficiency: ProficiencySchema,
  propertySlot: ComputedSlotSchema,
  reference: ReferenceSchema,
  roll: ComputedRollSchema,
  savingThrow: ComputedSavingThrowSchema,
  skill: ComputedSkillSchema,
  spellList: ComputedSpellListSchema,
  spell: ComputedSpellSchema,
  toggle: ComputedToggleSchema,
  trigger: ComputedTriggerSchema,
  container: ComputedContainerSchema,
  item: ComputedItemSchema,
  any: new SimpleSchema({}),
};

export default propertySchemasIndex;
