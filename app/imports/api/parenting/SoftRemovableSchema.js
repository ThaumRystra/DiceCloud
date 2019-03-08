import schema from '/imports/api/schema.js';

let SoftRemovableSchema = schema({
	"removed": {
    type: Boolean,
    optional: true,
    index: 1,
  },
  "removedAt": {
    type: Date,
    optional: true,
    index: 1,
  },
  "removedWith": {
    optional: true,
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
  },
});

export default SoftRemovableSchema;
