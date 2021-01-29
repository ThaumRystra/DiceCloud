import SimpleSchema from 'simpl-schema';
import { ComputedActionSchema } from '/imports/api/properties/Actions.js';
import { ComputedAdjustmentSchema } from '/imports/api/properties/Adjustments.js';
import { ComputedAttackSchema } from '/imports/api/properties/Attacks.js';
import { ComputedAttributeSchema } from '/imports/api/properties/Attributes.js';
import { ComputedBuffSchema } from '/imports/api/properties/Buffs.js';
import { ClassLevelSchema } from '/imports/api/properties/ClassLevels.js';
import { ComputedContainerSchema } from '/imports/api/properties/Containers.js';
import { ComputedDamageSchema } from '/imports/api/properties/Damages.js';
import { DamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers.js';
import { ComputedEffectSchema } from '/imports/api/properties/Effects.js';
import { ComputedFeatureSchema } from '/imports/api/properties/Features.js';
import { FolderSchema } from '/imports/api/properties/Folders.js';
import { ComputedItemSchema } from '/imports/api/properties/Items.js';
import { ComputedNoteSchema } from '/imports/api/properties/Notes.js';
import { ProficiencySchema } from '/imports/api/properties/Proficiencies.js';
import { ComputedRollSchema } from '/imports/api/properties/Rolls.js';
import { ComputedSavingThrowSchema } from '/imports/api/properties/SavingThrows.js';
import { ComputedSkillSchema } from '/imports/api/properties/Skills.js';
import { ComputedSlotSchema } from '/imports/api/properties/Slots.js';
import { SlotFillerSchema } from '/imports/api/properties/SlotFillers.js';
import { ComputedSpellSchema } from '/imports/api/properties/Spells.js';
import { ComputedSpellListSchema } from '/imports/api/properties/SpellLists.js';
import { ComputedToggleSchema } from '/imports/api/properties/Toggles.js';

const propertySchemasIndex = {
  action: ComputedActionSchema,
  adjustment: ComputedAdjustmentSchema,
  attack: ComputedAttackSchema,
  attribute: ComputedAttributeSchema,
  buff: ComputedBuffSchema,
  classLevel: ClassLevelSchema,
  damage: ComputedDamageSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: ComputedEffectSchema,
  feature: ComputedFeatureSchema,
  folder: FolderSchema,
  note: ComputedNoteSchema,
  proficiency: ProficiencySchema,
  propertySlot: ComputedSlotSchema,
  roll: ComputedRollSchema,
  savingThrow: ComputedSavingThrowSchema,
  skill: ComputedSkillSchema,
  slotFiller: SlotFillerSchema,
  spellList: ComputedSpellListSchema,
  spell: ComputedSpellSchema,
  toggle: ComputedToggleSchema,
  container: ComputedContainerSchema,
  item: ComputedItemSchema,
  any: new SimpleSchema({}),
};

export default propertySchemasIndex;
