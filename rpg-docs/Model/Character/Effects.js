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
		optional: true //TODO make necessary if there is no owner
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
		optional: true
	},
	//indicates what the effect originated from
	type: {
		type: String,
		defaultValue: "editable",
		allowedValues: ["editable", "feature", "buff", "equipment", "inate"]
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

//Keep effects in-sync with items
Effects.find({type: "equipment"}, {fields: {type: 1, enabled: 1, sourceId: 1}}).observe({
	added: function(newEffect){
		var item = Items.findOne(newEffect.sourceId);
		if(item && item.equipped !== newEffect.enabled){
			Effects.update(newEffect._id, {$set: {enabled: item.equipped}})
		}
	},
	changed: function(newEffect, oldEffect){
		var item = Items.findOne(newEffect.sourceId);
		if(item && item.equipped !== newEffect.enabled){
			Effects.update(newEffect._id, {$set: {enabled: item.equipped}})
		}
	}
})