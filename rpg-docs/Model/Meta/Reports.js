Reports = new Mongo.Collection("reports");

Schemas.Report = new SimpleSchema({
	owner: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
	title: {
		type: String,
		trim: false,
	},
	description: {
		type: String,
		trim: false,
	},
	type: {
		type: String,
		allowedValues: ["bug", "change", "feature", "general"],
		defaultValue: "bug",
	},
	//the immediate impact of doing this action (eg. -1 rages)
	severity: {
		type: Number,
		defaultValue: 5,
		min: 1,
		max: 10,
	},
	metaData: {
		type: Object,
		blackbox: true,
	},
});

Reports.attachSchema(Schemas.Report);

Meteor.methods({
	insertReport: function(report) {
		check(report, {
			title: String,
			description: String,
			type: String,
			severity: Number,
			metaData: Object,
		});
		report.owner = this.userId;
		Reports.insert(report);
	},
	deleteReport: function(id) {
		var user = Meteor.users.findOne(this.userId);
		if (!_.contains(user.roles, "admin")){
			throw new Meteor.Error(
				"not admin",
				"The user must be an administrator to delete feedback"
			);
		}
		Reports.remove(id);
	},
});
