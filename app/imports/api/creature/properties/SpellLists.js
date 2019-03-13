import schema from '/imports/api/schema.js';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

let SpellLists = new Mongo.Collection("spellLists");

let SpellListSchema = schema({
	description: {
		type: String,
		optional: true,
	},
	// Calculation of save DC used for all spells in this list
	saveDC: {
		type: String,
		optional: true,
	},
	// Calculation of attack bonus used for all spells in this list
	attackBonus: {
		type: String,
		optional: true,
	},
	// Calculation of how many spells in this list can be prepared
	maxPrepared: {
		type: String,
		optional: true,
	},
});

SpellListSchema.extend(ColorSchema);

SpellLists.attachSchema(SpellListSchema);
SpellLists.attachSchema(PropertySchema);
SpellLists.attachSchema(ChildSchema);

export default SpellLists;
