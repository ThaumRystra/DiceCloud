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
	name: "converts effect proficiencies to proficiency objects, removes types from assets",
	up: function() {
		//convert proficiency effects to proficiency objects
		Effects.find({operation: "proficiency"}).forEach(function(effect){
			var type = "skill";
			if (_.contains(SAVES, effect.stat)) type = "save";
			Proficiencies.insert({
				charId: effect.charId,
				name: effect.stat,
				value: effect.value,
				parent: _.clone(effect.parent),
				type: type,
				enabled: effect.enabled,
			}, function(err){
				if (!err) Effects.remove(effect._id);
			});
		});
		//store type as a parent group if it's needed
		Effects.find({"parent.collection": "Characters"}).forEach(function(e){
			Effects.update(e._id, {$set: {"parent.group": e.type}});
		});
		Attacks.find({"parent.collection": "Characters"}).forEach(function(a){
			Attacks.update(a._id, {$set: {"parent.group": a.type}});
		});
		//remove type
		Effects.update({}, {$unset: {type: ""}}, {validate: false, multi: true});
		Attacks.update({}, {$unset: {type: ""}}, {validate: false, multi: true});
		//remove languages and proficiencies
		Characters.update(
			{},
			{$unset: {languages: "", proficiencies: ""}},
			{validate: false, multi: true}
		);
	},
});

Migrations.add({
	version: 2,
	name: "Converts attacks from damage dice and damage bonus to a string with curly bracket calculations, adds settings.showIncrement to items",
	up: function() {
		//update attacks
		Attacks.find({}).forEach(function(attack) {
			if (!attack.damage && attack.damageDice && attack.damageBonus){
				var newDamage = attack.damageDice +
					" + {" + attack.damageBonus + "}";
				Attacks.update(
					attack._id,
					{
						$unset: {
							damageBonus: "",
							damageDice: "",
						},
						$set: {
							damage: newDamage
						},
					},
					{validate: false});
			}
		});
		//update Items
		Items.update(
			{settings: undefined},
			{$set: {"settings.showIncrement" : false}},
			{validate: false, multi: true}
		);
	},
});

Migrations.add({
	version: 3,
	name: "Converts attacks from damage dice and damage bonus to a string with curly bracket calculations, adds settings.showIncrement to items",
	up: function() {
		//update characters
		Characters.update(
			{"settings.useVariantEncumbrance": undefined},
			{$set: {"settings.useVariantEncumbrance" : false}},
			{validate: false, multi: true}
		);
		Characters.update(
			{"settings.useStandardEncumbrance": undefined},
			{$set: {"settings.useStandardEncumbrance" : true}},
			{validate: false, multi: true}
		);
	},
});

Migrations.add({
	version: 4,
	name: "Adds an effect to give characters a base carry capacity",
	up: function() {
		//update characters

		Characters.find({}).forEach(function(char){
			Characters.update(char._id, {
				$set: {
					carryMultiplier: {
						adjustment: 0,
						reset: "longRest",
					}
				}
			});
			var effect = Effects.findOne({
				charId: char._id, name: "Natural Carrying Capacity"
			});
			if (effect) return;
			Effects.insert({
				charId: char._id,
				name: "Natural Carrying Capacity",
				stat: "carryMultiplier",
				operation: "base",
				value: "1",
				parent: {
					id: char._id,
					collection: "Characters",
					group: "Inate",
				},
			});
			effect = Effects.findOne({
				charId: char._id, name: "Natural Carrying Capacity"
			});
			if (!effect) throw "Carry capacity effect should be set by now."
		});
	},
	down: function(){
		return;
	},
});
