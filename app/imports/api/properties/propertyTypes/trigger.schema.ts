import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const eventOptions = {
  doActionProperty: 'Do action',
  check: 'Roll check',
  damageProperty: 'Trigger damaged or healed',
  anyRest: 'Short or long rest',
  longRest: 'Long rest',
  shortRest: 'Short rest',
};

export const timingOptions = {
  before: 'Before',
  after: 'After',
  afterChildren: 'After Children',
};

export const actionPropertyTypeOptions = {
  action: 'Action',
  ammo: 'Ammo used',
  adjustment: 'Trigger damage',
  branch: 'Branch',
  buff: 'Buff',
  buffRemover: 'Buff Removed',
  damage: 'Damage',
  note: 'Note',
  roll: 'Roll',
  savingThrow: 'Saving throw',
  spell: 'Spell',
  toggle: 'Toggle',
};

export const triggerSchema = z.object({
  type: z.literal('trigger'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  description: inlineCaluclationFieldSchema,
  event: z
    .enum([
      'doActionProperty',
      'check',
      'damageProperty',
      'anyRest',
      'longRest',
      'shortRest',
    ])
    .default('doActionProperty'),
  // Action type
  actionPropertyType: z
    .enum([
      'action',
      'ammo',
      'adjustment',
      'branch',
      'buff',
      'buffRemover',
      'damage',
      'note',
      'roll',
      'savingThrow',
      'spell',
      'toggle',
    ])
    .optional(),
  timing: z.enum(['before', 'after', 'afterChildren']).default('after'),
  condition: calculationFieldSchema.meta({ parseLevel: 'compile' }),
  // Which tags the trigger is applied to
  targetTags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .optional(),
  extraTags: z
    .array(
      z.object({
        _id: z
          .string()
          .max(32)
          .default(() => Random.id()),
        operation: z.enum(['OR', 'NOT']).default('OR'),
        tags: z
          .array(z.string().max(STORAGE_LIMITS.tagLength))
          .max(STORAGE_LIMITS.tagCount),
      }),
    )
    .max(STORAGE_LIMITS.extraTagsCount)
    .optional(),
  // Prevent the property from showing up in the log
  silent: z.boolean().optional(),
});

export const computedTriggerSchema = z.object({
  ...triggerSchema.shape,
  summary: computedInlineCalculationFieldSchema,
  description: computedInlineCalculationFieldSchema,
  condition: computedCalculationFieldSchema.meta({ parseLevel: 'compile' }),
});

export type Trigger = z.infer<typeof triggerSchema>;
export type ComputedTrigger = z.infer<typeof computedTriggerSchema>;
