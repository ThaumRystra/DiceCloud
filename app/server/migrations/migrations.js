Meteor.methods({
	getVersion: function() {
		return Migrations.getVersion();
	},
	migrateTo: function(versionNumber) {
		var user = Meteor.users.findOne(this.userId);
		if (!user){
			throw new Meteor.Error(
				"logged-out",
				"The user must be logged in to migrate the database"
			);
		}
		if (_.contains(user.roles, "admin")){
			Migrations.migrateTo(versionNumber);
		} else {
			throw new Meteor.Error(
				"not admin",
				"The user must be an administrator to migrate the database"
			);
		}
	},
});

Migrations.add({
	version: 1,
	name: "Gives all characters a URL name",
	up: function() {
		//update characters
		Characters.find({}).forEach(function(char){
			if (char.urlName) return;
			var urlName = getSlug(char.name, {maintainCase: true}) || "-";
			Characters.update(char._id, {$set: {urlName}});
		});
	},
	down: function(){
		return;
	},
});

Migrations.add({
	version: 2,
	name: "Adds TempHP as a character attribute",
	up: function() {
		//update characters
		Characters.find({}).forEach(function(char){
			if (char.tempHP) return;
			Characters.update(char._id, {$set: {
				"tempHP.adjustment": 0,
				"tempHP.reset": "longRest",
			}});
		});
	},
	down: function(){
		return;
	},
});

Migrations.add({
	version: 3,
	name: "Moves all character attributes off the character document",
	up: function () {
		const batchSize = 50;
		const stats = [
			// Abilities
			"strength",
			"dexterity",
			"constitution",
			"intelligence",
			"wisdom",
			"charisma",

			// Stats
			"hitPoints",
			"tempHP",
			"experience",
			"proficiencyBonus",
			"speed",
			"weight",
			"age",
			"ageRate",
			"armor",
			"carryMultiplier",

			// Resources
			"level1SpellSlots",
			"level2SpellSlots",
			"level3SpellSlots",
			"level4SpellSlots",
			"level5SpellSlots",
			"level6SpellSlots",
			"level7SpellSlots",
			"level8SpellSlots",
			"level9SpellSlots",
			"ki",
			"sorceryPoints",
			"rages",
			"superiorityDice",
			"expertiseDice",
			"rageDamage",

			// Hit Dice
			"d6HitDice",
			"d8HitDice",
			"d10HitDice",
			"d12HitDice",

			// Damage Multipliers
			"acidMultiplier",
			"bludgeoningMultiplier",
			"coldMultiplier",
			"fireMultiplier",
			"forceMultiplier",
			"lightningMultiplier",
			"necroticMultiplier",
			"piercingMultiplier",
			"poisonMultiplier",
			"psychicMultiplier",
			"radiantMultiplier",
			"slashingMultiplier",
			"thunderMultiplier",

			// Saves
			"strengthSave",
			"dexteritySave",
			"constitutionSave",
			"intelligenceSave",
			"wisdomSave",
			"charismaSave",

			// Skills
			"acrobatics",
			"animalHandling",
			"arcana",
			"athletics",
			"deception",
			"history",
			"insight",
			"intimidation",
			"investigation",
			"medicine",
			"nature",
			"perception",
			"performance",
			"persuasion",
			"religion",
			"sleightOfHand",
			"stealth",
			"survival",
			"initiative",
			"dexterityArmor",
		];
		let modifier = {$unset: {}};
		_.each(stats, stat => {
			modifier.$unset[stat] = 1;
		});
		let charIds, defaultDocs;
		let migrateBatch = function(){
			// Iterate over a batch of characters at a time
			charIds = Characters.find(
				{strength: {$exists: true}},
				{fields: {_id: 1}, limit: batchSize},
			).map(char => char._id);
			if (!charIds.length) {
				return;
			}
			_.each(charIds, charId => {
				// Add all the stats to their own collections
				defaultDocs = getDefaultCharacterDocs(charId);
				Attributes.rawCollection().insert(defaultDocs.attributes, {ordered: false});
				Skills.rawCollection().insert(defaultDocs.skills, {ordered: false});
				DamageMultipliers.rawCollection().insert(defaultDocs.damageMultipliers, {ordered: false});
				// Remove the stats on the character document
				Characters.update(charId, modifier, {validate: false}, function(error, result){
					if (error) console.log(error);
				});
			});
			// Do the next batch
			Meteor.defer(migrateBatch);
		};
		migrateBatch();
	},
	down: function () {
		return;
	}
});
