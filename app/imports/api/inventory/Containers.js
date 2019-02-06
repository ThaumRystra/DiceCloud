import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import {makeParent} from "/imports/api/parenting.js";
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

//set up the collection for containers
let Containers = new Mongo.Collection("containers");

let containerSchema = schema({
	name:       {type: String, optional: true, trim: false},
	charId:     {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	isCarried:  {type: Boolean},
	weight:		{type: Number, min: 0, defaultValue: 0},
	value:		{type: Number, min: 0, defaultValue: 0},
	description:{type: String, optional: true, trim: false},
});

Containers.attachSchema(containerSchema);
Containers.attachSchema(ColorSchema);

Containers.helpers({
	contentsValue: function(){
		var value = 0;
		Items.find(
			{"parent.id": this._id},
			{fields: {quantity: 1, value: 1}}
		).forEach(function(item){
			value += item.totalValue();
		});
		return value;
	},
	totalValue: function(){
		return this.contentsValue() + this.value;
	},
	contentsWeight: function(){
		var weight = 0;
		Items.find(
			{"parent.id": this._id},
			{fields: {quantity: 1, weight: 1}}
		).forEach(function(item){
			weight += item.totalWeight();
		});
		return weight;
	},
	totalWeight: function(){
		return this.contentsWeight() + this.weight;
	},
	moveToCharacter: function(characterId){
		if (this.charId === characterId) return;
		Items.update(this._id, {$set: {charId: characterId}});
	},
});

// Containers.attachBehaviour("softRemovable");
makeParent(Containers); //parents of items

export default Containers;
