import SimpleSchema from 'simpl-schema';
import { ComputedOnlyActionSchema } from '/imports/api/properties/Actions.js';
import { ComputedOnlyAdjustmentSchema } from '/imports/api/properties/Adjustments.js';
import { ComputedOnlyAttackSchema } from '/imports/api/properties/Attacks.js';
import { ComputedOnlyAttributeSchema } from '/imports/api/properties/Attributes.js';
import { ComputedOnlyBuffSchema } from '/imports/api/properties/Buffs.js';
import { ClassLevelSchema } from '/imports/api/properties/ClassLevels.js';
import { ConstantSchema } from '/imports/api/properties/Constants.js';
import { ComputedOnlyContainerSchema } from '/imports/api/properties/Containers.js';
import { ComputedOnlyDamageSchema } from '/imports/api/properties/Damages.js';
import { DamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers.js';
import { ComputedOnlyEffectSchema } from '/imports/api/properties/Effects.js';
import { ComputedOnlyFeatureSchema } from '/imports/api/properties/Features.js';
import { FolderSchema } from '/imports/api/properties/Folders.js';
import { ComputedOnlyItemSchema } from '/imports/api/properties/Items.js';
import { ComputedOnlyNoteSchema } from '/imports/api/properties/Notes.js';
import { ProficiencySchema } from '/imports/api/properties/Proficiencies.js';
import { ComputedOnlyRollSchema } from '/imports/api/properties/Rolls.js';
import { ComputedOnlySavingThrowSchema } from '/imports/api/properties/SavingThrows.js';
import { ComputedOnlySkillSchema } from '/imports/api/properties/Skills.js';
import { ComputedOnlySlotSchema } from '/imports/api/properties/Slots.js';
import { SlotFillerSchema } from '/imports/api/properties/SlotFillers.js';
import { ComputedOnlySpellSchema } from '/imports/api/properties/Spells.js';
import { ComputedOnlySpellListSchema } from '/imports/api/properties/SpellLists.js';
import { ComputedOnlyToggleSchema } from '/imports/api/properties/Toggles.js';

const propertySchemasIndex = {
  action: ComputedOnlyActionSchema,
  adjustment: ComputedOnlyAdjustmentSchema,
  attack: ComputedOnlyAttackSchema,
  attribute: ComputedOnlyAttributeSchema,
  buff: ComputedOnlyBuffSchema,
  classLevel: ClassLevelSchema,
  constant: ConstantSchema,
  container: ComputedOnlyContainerSchema,
  damage: ComputedOnlyDamageSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: ComputedOnlyEffectSchema,
  feature: ComputedOnlyFeatureSchema,
  folder: FolderSchema,
  item: ComputedOnlyItemSchema,
  note: ComputedOnlyNoteSchema,
  proficiency: ProficiencySchema,
  propertySlot: ComputedOnlySlotSchema,
  roll: ComputedOnlyRollSchema,
  savingThrow: ComputedOnlySavingThrowSchema,
  skill: ComputedOnlySkillSchema,
  slotFiller: SlotFillerSchema,
  spellList: ComputedOnlySpellListSchema,
  spell: ComputedOnlySpellSchema,
  toggle: ComputedOnlyToggleSchema,
  any: new SimpleSchema({}),
};

export default propertySchemasIndex;
