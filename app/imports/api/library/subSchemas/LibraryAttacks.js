import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';

libraryAttacksSchema = schema({
	name: {
		type: String,
		defaultValue: "New Attack",
		trim: false,
	},
	details: {
		type: String,
		optional: true,
		trim: false,
	},
	attackBonus: {
		type: String,
		optional: true,
		trim: false,
	},
	damage: {
		type: String,
		optional: true,
		trim: false,
	},
	damageType: {
		type: String,
		allowedValues: [
			"bludgeoning",
			"piercing",
			"slashing",
			"acid",
			"cold",
			"fire",
			"force",
			"lightning",
			"necrotic",
			"poison",
			"psychic",
			"radiant",
			"thunder",
		],
		defaultValue: "slashing",
	},
});

export default libraryAttacksSchema;
