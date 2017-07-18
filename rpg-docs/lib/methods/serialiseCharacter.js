var arraySerialise = function(collection, data) {
	cursor = collection.find(data, {reactive: false});
	array = []
	cursor.forEach( (doc) => {
		if (!doc.removed) { //skip if it's been soft-removed
			temp = _.clone(doc) //for safety

			delete temp.restoredAt;
			delete temp.restoredBy; //we don't need these

			array.push(temp);
		}
	} ) 
	return array;
}

var checkWritePermission = function(charId) {
	if (!Meteor.call("canWriteCharacter", charId)){
		throw new Meteor.Error(
			"Access denied",
			"You do not have permission to edit the assets of this character"
		);
	}
};

Meteor.methods({
	serialiseCharacter: function(charId) {
		char = {
			character: arraySerialise(Characters, {"_id": charId})[0], //hack as Characters.findOne() seemed to break everything
			elements: {
				actions:			arraySerialise(Actions, {"charId": charId}),
				attacks:			arraySerialise(Attacks, {"charId": charId}),
				buffs:				arraySerialise(Buffs, {"charId": charId}),
				classes:			arraySerialise(Classes, {"charId": charId}),
				containers:			arraySerialise(Containers, {"charId": charId}),
				effects:			arraySerialise(Effects, {"charId": charId}),
				experiences:		arraySerialise(Experiences, {"charId": charId}),
				features:			arraySerialise(Features, {"charId": charId}),
				items:				arraySerialise(Items, {"charId": charId}),
				notes:				arraySerialise(Notes, {"charId": charId}),
				proficiencies:		arraySerialise(Proficiencies, {"charId": charId}),
				spellLists:			arraySerialise(SpellLists, {"charId": charId}),
				spells:				arraySerialise(Spells, {"charId": charId}),
				temporaryHitPoints:	arraySerialise(TemporaryHitPoints, {"charId": charId}),
			}
		};
		var json = JSON.stringify(char);
		return json;
	},

	importCharacter : function(charId, json) {
		checkWritePermission(charId);

		var collections = {
			"actions": Actions,
			"attacks": Attacks,
			"buffs": Buffs,
			"classes": Classes,
			"containers": Containers,
			"effects": Effects,
			"experiences": Experiences,
			"features": Features,
			"items": Items,
			"notes": Notes,
			"proficiencies": Proficiencies,
			"spellLists": SpellLists,
			"spells": Spells,
			"temporaryHitPoints": TemporaryHitPoints,
		};

		//decode character data
		var characterData = JSON.parse(json);

		// check it's all valid
		var validationError = "";
		try {Schemas.SerialisedCharacter.validate(characterData)}
		catch (err) {validationError = err.message}

		if (validationError) {
			throw new Meteor.Error(
				"Invalid import data", validationError
			);
		}

		//update current character with new character details
		oldCharId = characterData.character._id;
		characterData.character._id = charId;
		Characters.update({"_id": charId}, {$set:characterData.character});

		//remove all elements of current character
		_.each(collections, function(value, key, list) {
			var collection = value;
			collection.remove({"charId": charId});
		})

		// replace all element charIds with the new charId
		_.each(characterData.elements, function(value, key, list){
			_.each(value, function(element, index, list) {
				element.charId = charId;
			})
		})

		// prepare for insertion
		var IDs = {}; // {"oldId":"newId"}; this will be extended
		IDs[oldCharId] = charId;
		
		// set up elements for insertion
		_.each(characterData.elements, function(value, key, list){
			var collection = collections[key];
			_.each(value, function(element, index, list) {
				element.__done = false; //__done is used to keep track of which elements we haven't yet insertec.
			})
		});

		//insert anything that is NOT a child
		_.each(characterData.elements, function(value, key, list){
			var collection = collections[key];
			_.each(value, function(element, index, list) {
				if (typeof element.parent == undefined || element.parent == null) { //if it does not have a parent
					var tmp = _.clone(element);
					delete tmp._id;
					delete tmp.__done;

					if (typeof tmp.createdAt !== 'undefined') { //re-encode the dates so they're actually dates and things don't break
						tmp.createdAt = new Date(tmp.createdAt)
						if (tmp.createdAt.valueOf() == NaN) {tmp.createdAt = new Date()} //in case the date string is broken
					}
					if (typeof tmp.dateAdded !== 'undefined') { //re-encode the dates so they're actually dates and things don't break
						tmp.dateAdded = new Date(tmp.dateAdded)
						if (tmp.dateAdded.valueOf() == NaN) {tmp.dateAdded = new Date()} //in case the date string is broken
					} 

					var newId = collection.insert(tmp);
					IDs[element._id] = newId; //save old ID in case something needs it as its parentId
					element.__done = true;

					// console.log(key + ": Added '" + tmp.name + "' with new ID " + newId + " (old ID " + element._id + ")");
				}
			})
		});

		// insert everything else
		// we run this five times - each iteration inserts elements that have one more generation of parents
		// first we do things that are just children (e.g. effects of features)
		// then grand-children (e.g. attacks of items in containers)
		// then great-grandchildren (e.g. effects of buffs of items in containers)
		// then two more times for safety
		for (var i=0; i<5; i++) {
			// console.log("iteration " + (i+1).toString());
			_.each(characterData.elements, function(value, key, list){
				var collection = collections[key]
				_.each(value, function(element, index, list) {
					if (!element.__done) { //only process elements we haven't already inserted
						if (element.parent.id in IDs) { //is the new ID of the parent in the list? If it's not there, we haven't inserted the parent into the list yet.
							var tmp = _.clone(element);
							delete tmp._id;
							delete tmp.__done;
							oldParentId = tmp.parent.id;
							tmp.parent.id = IDs[tmp.parent.id]; //so that it points to the ID of the new element
							var newId = collection.insert(tmp);
							IDs[element._id] = newId; //save old ID in case something needs it as its parentId
							element.__done = true;
							// console.log(key + ": Added '" + tmp.name + "' with new ID " + newId + " (old ID " + element._id + ")" + " to parent " + oldParentId + " (old ID " + element.parent.id + ")");
						}
					}
				})
			});
		};

		_.each(characterData.elements, function(value, key, list){
			_.each(value, function(element, index, list) {
				if (!element.__done) {
					// console.log("Could not add " + element.name + " (ID " + element._id + ", parent " + element.parent.id + ")")
				}
			})
		});


		// console.log(IDs);

		// anything still left is probably stuck in a parenting loop (i.e. parent if itself, or parent of its parent etc) which shouldn't exist, so we ignore it.
		// TODO: create a system for handling such cases.
	}
})