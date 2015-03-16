Effects = new Meteor.Collection("effects");

/*
 * Effects are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
Schemas.Effect = new SimpleSchema({
	charId: { 
		type: String, 
		regEx: SimpleSchema.RegEx.Id
	},
	name: {
		type: String,
		optional: true, //TODO make necessary if there is no owner
		trim: false
	},
	operation: {
		type: String,
		defaultValue: "add",
		allowedValues: ["base", "proficiency","add","mul","min","max","advantage","disadvantage","passiveAdd","fail","conditional"]
	},
	value: {
		type: Number,
		decimal: true,
		optional: true
	},
	calculation: {
		type: String,
		optional: true, 
		trim: false
	},
	//indicates what the effect originated from
	type: {
		type: String,
		defaultValue: "editable",
		allowedValues: ["editable", "feature", "class", "buff", "equipment", "racial", "inate"]
	},
	//the id of the feature, buff or item that created this effect
	sourceId: {
		type: String, 
		regEx: SimpleSchema.RegEx.Id,
		optional: true
	},
	//which stat the effect is applied to
	stat: {
		type: String,
		optional: true
	},
	enabled: {
		type: Boolean,
		defaultValue: true
	}
});

Effects.attachSchema(Schemas.Effect);

Characters.after.insert(function (userId, char) {
	if(Meteor.isServer){
		Effects.insert({
			charId: char._id,
			type: "inate",
			name: "Constitution modifier for each level",
			stat: "hitPoints",
			operation: "add",
			calculation: "level * constitutionMod"
		});
		Effects.insert({
			charId: char._id,
			type: "inate",
			name: "Proficiency bonus by level",
			stat: "proficiencyBonus",
			operation: "add",
			calculation: "floor(level / 4 + 1.75)"
		});
		Effects.insert({
			charId: char._id,
			type: "inate",
			name: "Dexterity Armor Bonus",
			stat: "armor",
			operation: "add",
			calculation: "dexterityArmor"
		});
		Effects.insert({
			charId: char._id,
			type: "inate",
			name: "Natural Armor",
			stat: "armor",
			operation: "base",
			value: 10
		});
	}
});

Effects.allow(CHARACTER_SUBSCHEMA_ALLOW);
Effects.deny(CHARACTER_SUBSCHEMA_DENY);
