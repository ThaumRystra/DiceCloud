import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

let ClassLevels = new Mongo.Collection("classLevels");

let ClassLevelSchema = schema({
	level: {
    type: SimpleSchema.Integer,
  },
});

ClassLevels.attachSchema(ClassLevelSchema);
ClassLevels.attachSchema(PropertySchema);
ClassLevels.attachSchema(ChildSchema);

export default ClassLevels;
export { ClassLevelSchema };
