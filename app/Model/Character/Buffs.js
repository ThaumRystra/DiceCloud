Buffs = new Mongo.Collection("buffs");

Schemas.Buff = new SimpleSchema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
	name: {
		type: String,
		optional: true,
		trim: false,
	},
	description: {
		type: String,
		optional: true,
		trim: false,
	},
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
	type: {
		type: String,
		allowedValues: [
			"inate", //this should be "innate", but changing it could be problematic
			"custom",
		],
	},
	"lifeTime.total": {
		type: Number,
		defaultValue: 0, //0 is infinite
		min: 0,
	},
	"lifeTime.spent": {
		type: Number,
		defaultValue: 0,
		min: 0,
	},
	color: {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
	appliedBy: { //the charId of whoever applied the buff
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
	appliedByDetails: {//the name and collection of the thing that applied the buff
		type: Object,
		optional: true,
	},
	"appliedByDetails.name": {
		type: String,
	},
	"appliedByDetails.collection": {
		type: String,
	},
});

Buffs.attachSchema(Schemas.Buff);

Buffs.attachBehaviour("softRemovable");
makeParent(Buffs, ["name", "enabled"]); //parents of effects, attacks, proficiencies

Buffs.allow(CHARACTER_SUBSCHEMA_ALLOW);
Buffs.deny(CHARACTER_SUBSCHEMA_DENY);

Meteor.methods({
	applyBuff: function(buffId, targetId){
		if (!Meteor.call("canWriteCharacter", targetId)){
			throw new Meteor.Error(
				"Access denied",
				"You do not have permission to buff this character"
			);
		}
		let buff = CustomBuffs.findOne(buffId);
		if (!buff) return;

		var parentCol = Meteor.isClient ?
			window[buff.parent.collection] : global[buff.parent.collection]
		var parent = parentCol.findOne(buff.parent.id);

		//insert new buff
		newBuffId = Buffs.insert({
			charId: targetId,
			name: buff.name,
			description: buff.description,
			lifeTime: {total: buff.lifeTime.total},
			type: "custom",

			appliedBy: buff.charId,
			appliedByDetails: {
				name: parent && parent.name || "",
				collection: buff.parent.collection,
			},
		});

		Meteor.call("cloneChildren", buffId, {id: newBuffId, collection: "Buffs"})
	}
})
