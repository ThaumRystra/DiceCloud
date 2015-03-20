Items = new Mongo.Collection('items');

Schemas.Item = new SimpleSchema({
	name: 		{type: String, defaultValue: "New Item", trim: false},
	plural:		{type: String, optional: true, trim: false},
	description:{type: String, optional: true, trim: false},
	charId:     {type: String, regEx: SimpleSchema.RegEx.Id}, //id of owner
	quantity:	{type: Number, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	equipmentSlot:	{
		type: String, 
		defaultValue: "none", 
		allowedValues: ["none", "head", "armor", "arms", "hands", "held", "feet"]
	},
	enabled:    {type: Boolean, defaultValue: false},
	color:      {type: String, allowedValues: _.pluck(colorOptions, "key"), defaultValue: "q"}
});

Items.attachSchema(Schemas.Item);

Items.helpers({
	totalValue: function(){
		return this.value * this.quantity;
	},
	totalWeight: function(){
		return this.weight * this.quantity;
	},
	pluralName: function(){
		if(this.plural && this.quantity !== 1){
			return this.plural;
		} else{
			return this.name;
		}
	},
	equip: function(characterId){
		var charId = characterId || this.charId;
		if(!charId || ! Characters.findOne(charId)) throw "Invalid character";
		if(this.parent.collection === "Characters" && this.parent.id === charId && this.enabled) return;
		Items.update(this._id, {$set: {"parent.collection": "Characters", "parent.id": charId, enabled: true}});
	},
	unequip: function(){
		if(!this.enabled) return;
		Items.update(this._id, {$set: {enabled: false}});
	},
	moveToContainer: function(containerId){
		if( !containerId || !Containers.findOne(containerId) ) throw "Invalid container";
		if(this.parent.collection === "Containers" && this.parent.id === containerId && !this.enabled) return;
		Items.update(this._id, {$set: {"parent.collection": "Containers", "parent.id": containerId, enabled: false}});
	},
	moveToCharacter: function(characterId){
		if(!characterId || ! Characters.findOne(characterId)) throw "Invalid character";
		if(this.parent.collection === "Characters" && this.parent.id === characterId && !this.enabled) return;
		Items.update(this._id, {$set: {"parent.collection": "Characters", "parent.id": characterId, charId: characterId, enabled: false}});
	}
});

Items.before.update(function(userId, doc, fieldNames, modifier, options){
	if(modifier && modifier.$set && modifier.$set.enabled){
		modifier.$set["parent.collection"] = "Characters";
		modifier.$set["parent.id"] = doc.charId;
	}
});

Items.attachBehaviour('softRemovable');
makeChild(Items); //children of containers
makeParent(Items, ['name', 'enabled']); //parents of effects and attacks

Items.allow(CHARACTER_SUBSCHEMA_ALLOW);
