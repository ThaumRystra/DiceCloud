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
