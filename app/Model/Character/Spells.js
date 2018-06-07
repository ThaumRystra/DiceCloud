Spells = new Mongo.Collection("spells");

Schemas.Spell = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	prepared: {
		type: String,
		defaultValue: "prepared",
		allowedValues: ["prepared", "unprepared", "always"],
	},
	name: {
		type: String,
		optional: true,
		trim: false,
		defaultValue: "New Spell",
	},
	description: {
		type: String,
		optional: true,
		trim: false,
	},
	castingTime: {
		type: String,
		optional: true,
		defaultValue: "action",
		trim: false,
	},
	range: {
		type: String,
		optional: true,
		trim: false,
	},
	duration: {
		type: String,
		optional: true,
		trim: false,
		defaultValue: "Instantaneous",
	},
	"components.verbal":        {type: Boolean, defaultValue: false},
	"components.somatic":       {type: Boolean, defaultValue: false},
	"components.concentration":	{type: Boolean, defaultValue: false},
	"components.material":      {type: String, optional: true},
	ritual:      {
		type: Boolean,
		defaultValue: false,
	},
	level:       {
		type: Number,
		defaultValue: 1,
	},
	school:      {
		type: String,
		defaultValue: "Abjuration",
		allowedValues: magicSchools,
	},
	color:       {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
});

Spells.attachSchema(Schemas.Spell);

Spells.attachBehaviour("softRemovable");
makeChild(Spells); //children of spell lists
makeParent(Spells, ["name", "enabled"]); //parents of attacks

Spells.after.update(function (userId, spell, fieldNames) {
	//Update prepared state of spell and child attacks to be enabled or not
	if (_.contains(fieldNames, "prepared")) {
		var childAttacks = Attacks.find({"parent.id": spell._id}).fetch();
		if (spell.prepared === "unprepared") {
			_.each(childAttacks, function(attack){
				Attacks.update(attack._id, {$set: {enabled: false}});
			});
		} else if (spell.prepared === "prepared" || "always") {
			_.each(childAttacks, function(attack){
				Attacks.update(attack._id, {$set: {enabled: true}});
			});
		}
	}
});

Spells.allow(CHARACTER_SUBSCHEMA_ALLOW);
Spells.deny(CHARACTER_SUBSCHEMA_DENY);




var checkMovePermission = function(spellId, parent, destinationOnly) {
	var spell = Spells.findOne(spellId);
	if (!spell)
		throw new Meteor.Error("No such spell",
		"An spell could not be found to move");
	//handle permissions
	var permission;

	if (!destinationOnly) { //if we're not modifying the origin, only the destination
		permission = Meteor.call("canWriteCharacter", spell.charId);
		if (!permission){
			throw new Meteor.Error("Access denied",
			"Not permitted to move spells from this character");
		}
	}
	if (parent.collection === "Characters"){
		permission = Meteor.call("canWriteCharacter", parent.id);
		if (!permission){
			throw new Meteor.Error("Access denied",
			"Not permitted to move spells to this character");
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
				"Not permitted to move spells to this character");
			}
		}
	}
};

var moveSpell = function(spellId, targetCollection, targetId) {
	var spell = Spells.findOne(spellId);
	if (!spell) return;
	targetCollection = targetCollection || spell.parent.collection;
	targetId = targetId || spell.parent.id;

	if (Meteor.isServer) {
		checkMovePermission(spellId, {collection: targetCollection, id: targetId}, false);
	}

	if (targetCollection == "Characters") { //then we are copying the spell to a different character.
		targetList = SpellLists.findOne({"charId": targetId});
		targetListId = targetList && targetList._id;
		if (!targetListId) {
			targetListId = SpellLists.insert({ //create a spell list if we don't already have one
				name: "New SpellList",
				charId: targetId,
				saveDC: "8 + intelligenceMod + proficiencyBonus",
				attackBonus: "intelligenceMod + proficiencyBonus",
			});
		}

		Spells.update(
			spellId,
			{$set: {
				charId: targetId,
				"parent.collection": "SpellLists",
				"parent.id": targetListId,
			}}
		);
	}
	else { //we are moving the spell within the same character
		//update the spell provided the update will actually change something
		if (
			spell.parent.collection !== targetCollection ||
			spell.parent.id !== targetId
		){
			Spells.update(
				spellId,
				{$set: {
					"parent.collection": targetCollection,
					"parent.id": targetId,
				}}
			);
		}
	}
};

var copySpell = function(spellId, targetCollection, targetId) {
	var spell = Spells.findOne(spellId);
	if (!spell) return;
	targetCollection = targetCollection || spell.parent.collection;
	targetId = targetId || spell.parent.id;

	if (Meteor.isServer) {
		checkMovePermission(spellId, {collection: targetCollection, id: targetId}, true); //we're only reading from the source character
	}


	if (targetCollection == "Characters") { //then we are copying the spell to a different character.
		targetList = SpellLists.findOne({"charId": targetId});
		targetListId = targetList && targetList._id;
		if (!targetListId) {
			targetListId = SpellLists.insert({ //create a spell list if we don't already have one
				name: "New SpellList",
				charId: targetId,
				saveDC: "8 + intelligenceMod + proficiencyBonus",
				attackBonus: "intelligenceMod + proficiencyBonus",
			});
		}

		newSpell = _.clone(spell);
		delete newSpell._id;
		newSpellId = Spells.insert(newSpell); //add a new copy of the spell
		Spells.update(
			newSpellId,
			{$set: {
				charId: targetId,
				"parent.collection": "SpellLists",
				"parent.id": targetListId,
			}}
		);
	}
	else { //else we are copying the spell within the same character
		newSpell = _.clone(spell);
		delete newSpell._id;
		newSpellId = Spells.insert(newSpell); //add a new copy of the spell
		Spells.update(
			newSpellId,
			{$set: {
				"parent.collection": targetCollection,
				"parent.id": targetId,
			}}
		);
	}
};


Meteor.methods({
	moveSpellToList: function(spellId, spellListId) {
		check(spellId, String);
		check(spellListId, String);
		moveSpell(spellId, "SpellLists", spellListId);
	},
	copySpellToList: function(spellId, spellListId) {
		check(spellId, String);
		check(spellListId, String);
		copySpell(spellId, "SpellLists", spellListId);
	},
	moveSpellToCharacter: function(spellId, charId) {
		check(spellId, String);
		check(charId, String);
		moveSpell(spellId, "Characters", charId);
	},
	copySpellToCharacter: function(spellId, charId) {
		check(spellId, String);
		check(charId, String);
		copySpell(spellId, "Characters", charId);
	},
});