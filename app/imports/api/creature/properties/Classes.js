import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

let Classes = new Mongo.Collection("classes");

let ClassSchema = schema({});

ClassSchema.extend(ColorSchema);

Classes.attachSchema(ClassSchema);
Classes.attachSchema(PropertySchema);
Classes.attachSchema(ChildSchema);

export default Classes;
export { ClassSchema };
