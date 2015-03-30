Items = new Mongo.Collection('items');

Schemas.Item = new SimpleSchema({
	name:       {type: String, defaultValue: "New Item", trim: false},
	plural:		{type: String, optional: true, trim: false},
	description:{type: String, optional: true, trim: false},
	charId:     {type: String, regEx: SimpleSchema.RegEx.Id}, //id of owner
	quantity:	{type: Number, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
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
	},
	splitToParent: function(parent, moveQuantity){
		check(parent, {id: String, collection: String});
		check(moveQuantity, Number);
		var parentCollection = Meteor.isClient? window[parent.collection] : global[parent.collection];
		if(!parent.id || !parentCollection.findOne(parent.id)) throw "Invalid parent";
		var oldStack = this;
		//we can only move as much as we have, leaving 0 behind at worst
		if(oldStack.quantity < moveQuantity) moveQuantity = oldStack.quantity;
		var oldQuantity = oldStack.quantity - moveQuantity;

		var newStack = _.pick(oldStack, Schemas.Item.objectKeys());
		newStack.parent = parent;
		newStack.quantity = moveQuantity;

		var existingStack = Items.findOne(_.omit(newStack, "quantity"));
		var updateStackSize = function(){
			if(oldQuantity > 0){
				Items.update(oldStack._id, {$set: {quantity: oldQuantity}});
			} else {
				Items.remove(oldStack._id);
			}
		};
		if(existingStack){
			Items.update(existingStack._id, {$inc: {quantity: moveQuantity}}, {}, function(){
				updateStackSize();
			});
		}else{
			Items.insert(newStack, function(err, id){
				if(err) throw err;
				updateStackSize();
				//copy the children also
				Meteor.call("cloneChildren", oldStack._id, {collection: "Items", id: id});
			});
		}
	}
});

Items.before.update(function(userId, doc, fieldNames, modifier, options){
	if(
		modifier && modifier.$set && modifier.$set.enabled && //we are equipping this item
		!(modifier.$set["parent.collection"] === "Characters" && modifier.$set["parent.id"]) //and we haven't specified a character to equip to
	){
		//equip it to the current character
		modifier.$set["parent.collection"] = "Characters";
		modifier.$set["parent.id"] = doc.charId;
	}
});

Items.attachBehaviour('softRemovable');
makeChild(Items); //children of containers
makeParent(Items, ['name', 'enabled']); //parents of effects and attacks

Items.allow(CHARACTER_SUBSCHEMA_ALLOW);

//give characters default items
Characters.after.insert(function (userId, char) {
	if(Meteor.isServer){
		var containerId = Containers.insert({
			name: "Coin Pouch",
			charId: char._id,
			isCarried: true,
			description: "A sturdy pouch for coins",
			color: "d"
		});
		Items.insert({
			name: "Gold piece",
			plural: "Gold pieces",
			charId: char._id,
			quantity: 0,
			weight: 0.02,
			value: 1,
			color: "n",
			parent: {
				id: containerId,
				collection: "Containers"
			}
		});
		Items.insert({
			name: "Silver piece",
			plural: "Silver pieces",
			charId: char._id,
			quantity: 0,
			weight: 0.02,
			value: 0.1,
			color: "q",
			parent: {
				id: containerId,
				collection: "Containers"
			}
		});
		Items.insert({
			name: "Copper piece",
			plural: "Copper pieces",
			charId: char._id,
			quantity: 0,
			weight: 0.02,
			value: 0.01,
			color: "s",
			parent: {
				id: containerId,
				collection: "Containers"
			}
		});
	}
});
