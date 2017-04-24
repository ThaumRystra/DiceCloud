Schemas.LibraryAttacks = new SimpleSchema({
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
		defaultValue: "strengthMod + proficiencyBonus",
		optional: true,
		trim: false,
	},
	damage: {
		type: String,
		defaultValue: "1d8 + {strengthMod}",
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
