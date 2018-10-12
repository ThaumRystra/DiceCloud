Items = new Mongo.Collection("items");

Schemas.Item = new SimpleSchema({
	name:       {type: String, optional: true, trim: false, defaultValue: "New Item"},
	plural:		{type: String, optional: true, trim: false},
	description:{type: String, optional: true, trim: false},
	charId:     {type: String, regEx: SimpleSchema.RegEx.Id, index: 1}, //id of owner
	quantity:	{type: Number, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	enabled:    {type: Boolean, defaultValue: false},
	requiresAttunement: {type: Boolean, defaultValue: false},
	"settings.showIncrement": {type: Boolean, defaultValue: false},
	color:      {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
});

Items.attachSchema(Schemas.Item);

var checkMovePermission = function(itemId, parent) {
	var item = Items.findOne(itemId);
	if (!item)
		throw new Meteor.Error("No such item",
		"An item could not be found to move");
	//handle permissions
	var permission = Meteor.call("canWriteCharacter", item.charId);
	if (!permission){
		throw new Meteor.Error("Access denied",
		"Not permitted to move items from this character");
	}
	if (parent.collection === "Characters"){
		permission = Meteor.call("canWriteCharacter", parent.id);
		if (!permission){
			throw new Meteor.Error("Access denied",
			"Not permitted to move items to this character");
		}
	} else {
		var parentCollectionObject = global[parent.collection];
		var parentObject = null;
		if (parentCollectionObject)
			parentObject = parentCollectionObject.findOne(
				parent.id, {fields: {_id: 1, charId: 1}}
			);
		if (!parentObject) throw new Meteor.Error(
			"Invalid parent",
			"The destination parent " + parent.id +
			" does not exist in the collection " + parent.collection
		);
		if (parentObject.charId){
			permission = Meteor.call("canWriteCharacter", parentObject.charId);
			if (!permission){
				throw new Meteor.Error("Access denied",
				"Not permitted to move items to this character");
			}
		}
	}
};

var moveItem = function(itemId, enable, parentCollection, parentId) {
	var item = Items.findOne(itemId);
	if (!item) return;
	parentCollection = parentCollection || item.parent.collection;
	parentId = parentId || item.parent.id;

	if (Meteor.isServer) {
		checkMovePermission(itemId, {collection: parentCollection, id: parentId});
	}

	//update the item provided the update will actually change something
	if (
		item.parent.collection !== parentCollection ||
		item.parent.id !== parentId ||
		item.enabled !== enable
	){
		Items.update(
			itemId,
			{$set: {
				"parent.collection": parentCollection,
				"parent.id": parentId,
				enabled: enable,
			}}
		);
	}
};

Meteor.methods({
	moveItemToParent: function(itemId, parent) {
		check(itemId, String);
		check(parent, {collection: String, id: String});
		moveItem(itemId, false, parent.collection, parent.id);
	},
	moveItemToCharacter: function(itemId, charId) {
		check(itemId, String);
		check(charId, String);
		moveItem(itemId, false, "Characters", charId);
	},
	moveItemToContainer: function(itemId, containerId) {
		check(itemId, String);
		check(containerId, String);
		moveItem(itemId, false, "Containers", containerId);
	},
	equipItem: function(itemId, charId){
		check(itemId, String);
		check(charId, String);
		moveItem(itemId, true, "Characters", charId);
	},
	unequipItem: function(itemId, charId){
		check(itemId, String);
		check(charId, String);
		moveItem(itemId, false, "Characters", charId);
	},
	splitItemToParent: function(itemId, moveQuantity, parent){
		check(itemId, String);
		check(moveQuantity, Number);
		check(parent, {id: String, collection: String});

		//get the item
		var item = Items.findOne(itemId);
		if (!item) return;

		//don't bother moving nothing
		if (moveQuantity <= 0 || item.quantity <= 0){
			return;
		}
		//ensure we are only moving up to the current stack size
		if (item.quantity < moveQuantity){
			moveQuantity = this.quantity;
		}

		if (Meteor.isServer) {
			checkMovePermission(itemId, parent);
		}

		//create a new item stack
		var newStack = _.omit(EJSON.clone(item), "_id");
		newStack.parent = parent;
		newStack.quantity = moveQuantity;

		//find out if we have an exact replica in the destination
		var query = _.omit(newStack, ["parent", "quantity"]);
		query["parent.collection"] = newStack.parent.collection;
		query["parent.id"] = newStack.parent.id;
		query._id = {$ne: itemId}; //make sure we don't join it to itself
		var existingStack = Items.findOne(query);
		if (existingStack){
			//increase the existing stack's size
			Items.update(
				existingStack._id,
				{$inc: {quantity: moveQuantity}}
			);
		} else {
			//insert the new stack
			Items.insert(newStack, function(err, id){
				if (err) throw err;
				//copy the children also
				Meteor.call("cloneChildren", item._id, {collection: "Items", id: id});
			});
		}

		//reduce the old stack's size
		var oldQuantity = item.quantity - moveQuantity;
		if (oldQuantity === 0){
			Items.remove(itemId);
		} else {
			Items.update(itemId, {$set: {quantity: oldQuantity}});
		}
	},
});

Items.helpers({
	totalValue: function(){
		return this.value * this.quantity;
	},
	totalWeight: function(){
		return this.weight * this.quantity;
	},
	pluralName: function(){
		if (this.plural && this.quantity !== 1){
			return this.plural;
		} else {
			return this.name;
		}
	},
});

Items.before.update(function(userId, doc, fieldNames, modifier, options){
	if (
		modifier && modifier.$set && modifier.$set.enabled && //we are equipping this item
		!(
			modifier.$set["parent.collection"] === "Characters" &&
			modifier.$set["parent.id"]
		) //and we haven"t specified a character to equip to
	){
		//equip it to the current character
		modifier.$set["parent.collection"] = "Characters";
		modifier.$set["parent.id"] = doc.charId;
	}
});

Items.attachBehaviour("softRemovable");
makeChild(Items); //children of containers
makeParent(Items, ["name", "enabled"]); //parents of effects and attacks

Items.allow(CHARACTER_SUBSCHEMA_ALLOW);

//give characters default items
Characters.after.insert(function(userId, char) {
	if (Meteor.isServer){
		var containerId = Containers.insert({
			name: "Coin Pouch",
			charId: char._id,
			isCarried: true,
			description: "A sturdy pouch for coins",
			color: "d",
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
				collection: "Containers",
			},
			settings: {
				showIncrement: true,
			},
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
				collection: "Containers",
			},
			settings: {
				showIncrement: true,
			},
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
				collection: "Containers",
			},
			settings: {
				showIncrement: true,
			},
		});
	}
});
