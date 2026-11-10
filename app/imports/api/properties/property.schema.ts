import { z } from 'zod';
import {
  actionSchema,
  computedActionSchema,
} from './propertyTypes/action.schema';
import {
  adjustmentSchema,
  computedAdjustmentSchema,
} from '/imports/api/properties/propertyTypes/adjustment.schema';
import {
  attributeSchema,
  computedAttributeSchema,
} from '/imports/api/properties/propertyTypes/attribute.schema';
import {
  branchSchema,
  computedBranchSchema,
} from '/imports/api/properties/propertyTypes/branch.schema';
import {
  buffSchema,
  computedBuffSchema,
} from '/imports/api/properties/propertyTypes/buff.schema';
import {
  buffRemoverSchema,
  computedBuffRemoverSchema,
} from '/imports/api/properties/propertyTypes/buffRemover.schema';
import {
  classSchema,
  computedClassSchema,
} from '/imports/api/properties/propertyTypes/class.schema';
import {
  classLevelSchema,
  computedClassLevelSchema,
} from '/imports/api/properties/propertyTypes/classLevel.schema';
import {
  constantSchema,
  computedConstantSchema,
} from '/imports/api/properties/propertyTypes/constant.schema';
import {
  containerSchema,
  computedContainerSchema,
} from '/imports/api/properties/propertyTypes/container.schema';
import {
  damageSchema,
  computedDamageSchema,
} from '/imports/api/properties/propertyTypes/damage.schema';
import {
  damageMultiplierSchema,
  computedDamageMultiplierSchema,
} from '/imports/api/properties/propertyTypes/damageMultiplier.schema';
import {
  effectSchema,
  computedEffectSchema,
} from '/imports/api/properties/propertyTypes/effect.schema';
import {
  featureSchema,
  computedFeatureSchema,
} from '/imports/api/properties/propertyTypes/feature.schema';
import {
  folderSchema,
  computedFolderSchema,
} from '/imports/api/properties/propertyTypes/folder.schema';
import {
  itemSchema,
  computedItemSchema,
} from '/imports/api/properties/propertyTypes/item.schema';
import {
  noteSchema,
  computedNoteSchema,
} from '/imports/api/properties/propertyTypes/note.schema';
import {
  pointBuySchema,
  computedPointBuySchema,
} from '/imports/api/properties/propertyTypes/pointBuy.schema';
import {
  proficiencySchema,
  computedProficiencySchema,
} from '/imports/api/properties/propertyTypes/proficiency.schema';
import {
  referenceSchema,
  computedReferenceSchema,
} from '/imports/api/properties/propertyTypes/reference.schema';
import {
  rollSchema,
  computedRollSchema,
} from '/imports/api/properties/propertyTypes/roll.schema';
import {
  savingThrowSchema,
  computedSavingThrowSchema,
} from '/imports/api/properties/propertyTypes/savingThrow.schema';
import {
  skillSchema,
  computedSkillSchema,
} from '/imports/api/properties/propertyTypes/skill.schema';
import {
  spellSchema,
  computedSpellSchema,
} from '/imports/api/properties/propertyTypes/spell.schema';
import {
  spellListSchema,
  computedSpellListSchema,
} from '/imports/api/properties/propertyTypes/spellList.schema';
import {
  toggleSchema,
  computedToggleSchema,
} from '/imports/api/properties/propertyTypes/toggle.schema';
import {
  triggerSchema,
  computedTriggerSchema,
} from '/imports/api/properties/propertyTypes/trigger.schema';
import {
  computedCreatureTemplateSchema,
  creatureTemplateSchema,
} from '/imports/api/properties/propertyTypes/creatureTemplate.schema';
import {
  slotSchema,
  computedSlotSchema,
} from '/imports/api/properties/propertyTypes/slot.schema';

export const propertySchema = z.discriminatedUnion('type', [
  actionSchema,
  adjustmentSchema,
  attributeSchema,
  branchSchema,
  buffSchema,
  buffRemoverSchema,
  classSchema,
  classLevelSchema,
  constantSchema,
  containerSchema,
  creatureTemplateSchema,
  damageSchema,
  damageMultiplierSchema,
  effectSchema,
  featureSchema,
  folderSchema,
  itemSchema,
  noteSchema,
  pointBuySchema,
  proficiencySchema,
  slotSchema,
  referenceSchema,
  rollSchema,
  savingThrowSchema,
  skillSchema,
  spellSchema,
  spellListSchema,
  toggleSchema,
  triggerSchema,
]);

export const computedPropertySchema = z.discriminatedUnion('type', [
  computedActionSchema,
  computedAdjustmentSchema,
  computedAttributeSchema,
  computedBranchSchema,
  computedBuffSchema,
  computedBuffRemoverSchema,
  computedClassSchema,
  computedClassLevelSchema,
  computedConstantSchema,
  computedContainerSchema,
  computedCreatureTemplateSchema,
  computedDamageSchema,
  computedDamageMultiplierSchema,
  computedEffectSchema,
  computedFeatureSchema,
  computedFolderSchema,
  computedItemSchema,
  computedNoteSchema,
  computedPointBuySchema,
  computedProficiencySchema,
  computedSlotSchema,
  computedReferenceSchema,
  computedRollSchema,
  computedSavingThrowSchema,
  computedSkillSchema,
  computedSpellSchema,
  computedSpellListSchema,
  computedToggleSchema,
  computedTriggerSchema,
]);

export type Property = z.infer<typeof propertySchema>;
export type ComputedProperty = z.infer<typeof computedPropertySchema>;
export type PropertyType = Property['type'];
