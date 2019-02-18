import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';

const DamageSchema = schema({
  type: {
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
  roll: {
    type: String,
    optional: true,
    defaultValue: '1d8 + strengthMod',
  },
});

export default DamageSchema;
