import SimpleSchema from 'simpl-schema';
import { ActionSchema } from '/imports/api/properties/Actions.js';
import { AdjustmentSchema } from '/imports/api/properties/Adjustments.js';
import { AttackSchema } from '/imports/api/properties/Attacks.js';
import { ComputedAttributeSchema } from '/imports/api/properties/Attributes.js';
import { BuffSchema } from '/imports/api/properties/Buffs.js';
import { ClassLevelSchema } from '/imports/api/properties/ClassLevels.js';
import { ContainerSchema } from '/imports/api/properties/Containers.js';
import { DamageSchema } from '/imports/api/properties/Damages.js';
import { DamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers.js';
import { ComputedEffectSchema } from '/imports/api/properties/Effects.js';
import { ExperienceSchema } from '/imports/api/properties/Experiences.js';
import { FeatureSchema } from '/imports/api/properties/Features.js';
import { FolderSchema } from '/imports/api/properties/Folders.js';
import { ItemSchema } from '/imports/api/properties/Items.js';
import { NoteSchema } from '/imports/api/properties/Notes.js';
import { ProficiencySchema } from '/imports/api/properties/Proficiencies.js';
import { RollSchema } from '/imports/api/properties/Rolls.js';
import { SavingThrowSchema } from '/imports/api/properties/SavingThrows.js';
import { ComputedSkillSchema } from '/imports/api/properties/Skills.js';
import { SlotSchema } from '/imports/api/properties/Slots.js';
import { SpellSchema } from '/imports/api/properties/Spells.js';
import { SpellListSchema } from '/imports/api/properties/SpellLists.js';
import { ToggleSchema } from '/imports/api/properties/Toggles.js';

const propertySchemasIndex = {
  action: ActionSchema,
  adjustment: AdjustmentSchema,
  attack: AttackSchema,
  attribute: ComputedAttributeSchema,
  buff: BuffSchema,
  classLevel: ClassLevelSchema,
  damage: DamageSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: ComputedEffectSchema,
  experience: ExperienceSchema,
  feature: FeatureSchema,
  folder: FolderSchema,
  note: NoteSchema,
  proficiency: ProficiencySchema,
  roll: RollSchema,
  savingThrow: SavingThrowSchema,
  skill: ComputedSkillSchema,
  slot: SlotSchema,
  spellList: SpellListSchema,
  spell: SpellSchema,
  toggle: ToggleSchema,
  container: ContainerSchema,
  item: ItemSchema,
  any: new SimpleSchema({}),
};

export default propertySchemasIndex;
