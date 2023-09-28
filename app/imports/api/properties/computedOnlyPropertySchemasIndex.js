import SimpleSchema from 'simpl-schema';
import { ComputedOnlyActionSchema } from '/imports/api/properties/Actions';
import { ComputedOnlyAdjustmentSchema } from '/imports/api/properties/Adjustments';
import { ComputedOnlyAttributeSchema } from '/imports/api/properties/Attributes';
import { ComputedOnlyBuffSchema } from '/imports/api/properties/Buffs';
import { ComputedOnlyBuffRemoverSchema } from '/imports/api/properties/BuffRemovers';
import { ComputedOnlyBranchSchema } from '/imports/api/properties/Branches';
import { ComputedOnlyClassSchema } from '/imports/api/properties/Classes';
import { ComputedOnlyClassLevelSchema } from '/imports/api/properties/ClassLevels';
import { ComputedOnlyConstantSchema } from '/imports/api/properties/Constants';
import { ComputedOnlyContainerSchema } from '/imports/api/properties/Containers';
import { ComputedOnlyDamageSchema } from '/imports/api/properties/Damages';
import { ComputedOnlyDamageMultiplierSchema } from '/imports/api/properties/DamageMultipliers';
import { ComputedOnlyEffectSchema } from '/imports/api/properties/Effects';
import { ComputedOnlyFeatureSchema } from '/imports/api/properties/Features';
import { ComputedOnlyFolderSchema } from '/imports/api/properties/Folders';
import { ComputedOnlyItemSchema } from '/imports/api/properties/Items';
import { ComputedOnlyNoteSchema } from '/imports/api/properties/Notes';
import { ComputedOnlyPointBuySchema } from '/imports/api/properties/PointBuys';
import { ComputedOnlyProficiencySchema } from '/imports/api/properties/Proficiencies';
import { ComputedOnlyReferenceSchema } from '/imports/api/properties/References';
import { ComputedOnlyRollSchema } from '/imports/api/properties/Rolls';
import { ComputedOnlySavingThrowSchema } from '/imports/api/properties/SavingThrows';
import { ComputedOnlySkillSchema } from '/imports/api/properties/Skills';
import { ComputedOnlySlotSchema } from '/imports/api/properties/Slots';
import { ComputedOnlySpellSchema } from '/imports/api/properties/Spells';
import { ComputedOnlySpellListSchema } from '/imports/api/properties/SpellLists';
import { ComputedOnlyToggleSchema } from '/imports/api/properties/Toggles';
import { ComputedOnlyTriggerSchema } from '/imports/api/properties/Triggers';

const propertySchemasIndex = {
  action: ComputedOnlyActionSchema,
  adjustment: ComputedOnlyAdjustmentSchema,
  attribute: ComputedOnlyAttributeSchema,
  buff: ComputedOnlyBuffSchema,
  buffRemover: ComputedOnlyBuffRemoverSchema,
  branch: ComputedOnlyBranchSchema,
  class: ComputedOnlyClassSchema,
  classLevel: ComputedOnlyClassLevelSchema,
  constant: ComputedOnlyConstantSchema,
  container: ComputedOnlyContainerSchema,
  damage: ComputedOnlyDamageSchema,
  damageMultiplier: ComputedOnlyDamageMultiplierSchema,
  effect: ComputedOnlyEffectSchema,
  feature: ComputedOnlyFeatureSchema,
  folder: ComputedOnlyFolderSchema,
  item: ComputedOnlyItemSchema,
  note: ComputedOnlyNoteSchema,
  pointBuy: ComputedOnlyPointBuySchema,
  proficiency: ComputedOnlyProficiencySchema,
  propertySlot: ComputedOnlySlotSchema,
  reference: ComputedOnlyReferenceSchema,
  roll: ComputedOnlyRollSchema,
  savingThrow: ComputedOnlySavingThrowSchema,
  skill: ComputedOnlySkillSchema,
  spellList: ComputedOnlySpellListSchema,
  spell: ComputedOnlySpellSchema,
  toggle: ComputedOnlyToggleSchema,
  trigger: ComputedOnlyTriggerSchema,
  any: new SimpleSchema({}),
};

export default propertySchemasIndex;
