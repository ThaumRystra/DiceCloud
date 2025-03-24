import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const ClassLevelSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  // The name of this class level's variable
  variableName: {
    type: String,
    min: 2,
    regEx: VARIABLE_NAME_REGEX,
    max: STORAGE_LIMITS.variableName,
    optional: true,
  },
  level: {
    type: SimpleSchema.Integer,
    defaultValue: 1,
    max: STORAGE_LIMITS.levelMax,
  },
});

const ComputedOnlyClassLevelSchema = createPropertySchema({
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
});

const ComputedClassLevelSchema = TypedSimpleSchema.from({})
  .extend(ComputedOnlyClassLevelSchema)
  .extend(ClassLevelSchema);

export { ClassLevelSchema, ComputedOnlyClassLevelSchema, ComputedClassLevelSchema };
