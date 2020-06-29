import SimpleSchema from 'simpl-schema';
import { ComputedActionSchema } from '/imports/api/properties/Actions.js';
import { AdjustmentSchema } from '/imports/api/properties/Adjustments.js';
import { ComputedAttackSchema } from '/imports/api/properties/Attacks.js';
import { ComputedAttributeSchema } from '/imports/api/properties/Attributes.js';
import { BuffSchema } from '/imports/api/properties/Buffs.js';
import { ClassLevelSchema } from '/imports/api/properties/ClassLevels.js';
import { ContainerSchema } from '/imports/api/properties/Containers.js';
import { DamageSchema } from '/imports/api/properties/Damages.js';
import { DamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers.js';
import { ComputedEffectSchema } from '/imports/api/properties/Effects.js';
import { FeatureSchema } from '/imports/api/properties/Features.js';
import { FolderSchema } from '/imports/api/properties/Folders.js';
import { ItemSchema } from '/imports/api/properties/Items.js';
import { NoteSchema } from '/imports/api/properties/Notes.js';
import { ProficiencySchema } from '/imports/api/properties/Proficiencies.js';
import { RollSchema } from '/imports/api/properties/Rolls.js';
import { ComputedSavingThrowSchema } from '/imports/api/properties/SavingThrows.js';
import { ComputedSkillSchema } from '/imports/api/properties/Skills.js';
import { ComputedSlotSchema } from '/imports/api/properties/Slots.js';
import { ComputedSpellSchema } from '/imports/api/properties/Spells.js';
import { ComputedSpellListSchema } from '/imports/api/properties/SpellLists.js';
import { ToggleSchema } from '/imports/api/properties/Toggles.js';

const propertySchemasIndex = {
  action: ComputedActionSchema,
  adjustment: AdjustmentSchema,
  attack: ComputedAttackSchema,
  attribute: ComputedAttributeSchema,
  buff: BuffSchema,
  classLevel: ClassLevelSchema,
  damage: DamageSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: ComputedEffectSchema,
  feature: FeatureSchema,
  folder: FolderSchema,
  note: NoteSchema,
  proficiency: ProficiencySchema,
  roll: RollSchema,
  savingThrow: ComputedSavingThrowSchema,
  skill: ComputedSkillSchema,
  propertySlot: ComputedSlotSchema,
  spellList: ComputedSpellListSchema,
  spell: ComputedSpellSchema,
  toggle: ToggleSchema,
  container: ContainerSchema,
  item: ItemSchema,
  any: new SimpleSchema({}),
};

export default propertySchemasIndex;
