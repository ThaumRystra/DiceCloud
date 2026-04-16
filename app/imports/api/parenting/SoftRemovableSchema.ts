import type { TreeDoc } from '/imports/api/parenting/ChildSchema';
import { TypedSimpleSchema, type InferType } from '/imports/api/utility/TypedSimpleSchema';

const SoftRemovableSchema = TypedSimpleSchema.from({
  'removed': {
    type: Boolean,
    optional: true,
  },
  'removedAt': {
    type: Date,
    optional: true,
  },
  'removedWith': {
    optional: true,
    type: String,
    max: 32,
  },
});

export type SoftRemovable = InferType<typeof SoftRemovableSchema>;
export type SoftRemovableTreeDoc = SoftRemovable & TreeDoc;

export default SoftRemovableSchema;
