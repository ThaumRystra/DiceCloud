import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { TypedSimpleSchema, type InferType } from '/imports/api/utility/TypedSimpleSchema';


const creatureFolderSchema = TypedSimpleSchema.from({
  name: {
    type: String,
    trim: false,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  creatures: {
    type: Array,
    defaultValue: [],
  },
  'creatures.$': {
    type: String,
    max: 32,
  },
  owner: {
    type: String,
    max: 32,
  },
  archived: {
    type: Boolean,
    optional: true,
  },
  order: {
    type: Number,
    defaultValue: 0,
  },
});

export type CreatureFolder = InferType<typeof creatureFolderSchema>

const CreatureFolders = new Mongo.Collection<CreatureFolder>('creatureFolders');

CreatureFolders.attachSchema(creatureFolderSchema);

export default CreatureFolders;
