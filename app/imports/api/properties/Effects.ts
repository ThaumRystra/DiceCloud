import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import TagTargetingSchema from '/imports/api/properties/subSchemas/TagTargetingSchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

/*
 * Effects are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
const EffectSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  operation: {
    type: String,
    defaultValue: 'add',
    allowedValues: [
      'base',
      'add',
      'mul',
      'min',
      'max',
      'set',
      'advantage',
      'disadvantage',
      'passiveAdd',
      'fail',
      'conditional',
    ] as const,
  },
  amount: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  // Conditional benefits store just uncomputed text
  text: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.effectText,
  },
  // Which stats the effect is applied to
  // Each entry is a variableName targeted by this effect
  stats: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.statsToTarget,
  },
  'stats.$': {
    type: String,
    max: STORAGE_LIMITS.variableName,
  },
}).extend(TagTargetingSchema);

const ComputedOnlyEffectSchema = createPropertySchema({
  amount: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
});

const ComputedEffectSchema = TypedSimpleSchema.from({})
  .extend(ComputedOnlyEffectSchema)
  .extend(EffectSchema);

export { EffectSchema, ComputedEffectSchema, ComputedOnlyEffectSchema };
