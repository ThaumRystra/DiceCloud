import SimpleSchema from 'simpl-schema';
import { ActionSchema } from '/imports/api/properties/Actions.js';
import { AdjustmentSchema } from '/imports/api/properties/Adjustments.js';
import { AttributeSchema } from '/imports/api/properties/Attributes.js';
import { BuffSchema } from '/imports/api/properties/Buffs.js';
import { BuffRemoverSchema } from '/imports/api/properties/BuffRemovers.js';
import { BranchSchema } from '/imports/api/properties/Branches.js';
import { ClassSchema } from '/imports/api/properties/Classes.js';
import { ClassLevelSchema } from '/imports/api/properties/ClassLevels.js';
import { ConstantSchema } from '/imports/api/properties/Constants.js';
import { DamageSchema } from '/imports/api/properties/Damages.js';
import { DamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers.js';
import { EffectSchema } from '/imports/api/properties/Effects.js';
import { FeatureSchema } from '/imports/api/properties/Features.js';
import { FolderSchema } from '/imports/api/properties/Folders.js';
import { NoteSchema } from '/imports/api/properties/Notes.js';
import { PointBuySchema } from '/imports/api/properties/PointBuys.js';
import { ProficiencySchema } from '/imports/api/properties/Proficiencies.js';
import { ReferenceSchema } from '/imports/api/properties/References.js';
import { RollSchema } from '/imports/api/properties/Rolls.js';
import { SavingThrowSchema } from '/imports/api/properties/SavingThrows.js';
import { SkillSchema } from '/imports/api/properties/Skills.js';
import { SlotSchema } from '/imports/api/properties/Slots.js';
import { SpellListSchema } from '/imports/api/properties/SpellLists.js';
import { SpellSchema } from '/imports/api/properties/Spells.js';
import { ToggleSchema } from '/imports/api/properties/Toggles.js';
import { TriggerSchema } from '/imports/api/properties/Triggers.js';
import { ContainerSchema } from '/imports/api/properties/Containers.js';
import { ItemSchema } from '/imports/api/properties/Items.js';

const propertySchemasIndex = {
  action: ActionSchema,
  adjustment: AdjustmentSchema,
  attribute: AttributeSchema,
  buff: BuffSchema,
  buffRemover: BuffRemoverSchema,
  branch: BranchSchema,
  class: ClassSchema,
  classLevel: ClassLevelSchema,
  constant: ConstantSchema,
  damage: DamageSchema,
  damageMultiplier: DamageMultiplierSchema,
  effect: EffectSchema,
  feature: FeatureSchema,
  folder: FolderSchema,
  note: NoteSchema,
  pointBuy: PointBuySchema,
  proficiency: ProficiencySchema,
  propertySlot: SlotSchema,
  reference: ReferenceSchema,
  roll: RollSchema,
  savingThrow: SavingThrowSchema,
  skill: SkillSchema,
  spellList: SpellListSchema,
  spell: SpellSchema,
  toggle: ToggleSchema,
  trigger: TriggerSchema,
  container: ContainerSchema,
  item: ItemSchema,
  any: new SimpleSchema({}),
};

export default propertySchemasIndex;
