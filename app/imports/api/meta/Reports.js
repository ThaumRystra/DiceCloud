Reports = new Mongo.Collection("reports");

Schemas.Report = schema({
	owner: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
	title: {
		type: String,
		trim: false,
		optional: true,
	},
	description: {
		type: String,
		trim: false,
		optional: true,
	},
	type: {
		type: String,
		allowedValues: ["General Feedback", "Bug", "Suggested Change", "Feature Request"],
		defaultValue: "General Feedback",
	},
	//the immediate impact of doing this action (eg. -1 rages)
	severity: {
		type: SimpleSchema.Integer,
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
		var id = Reports.insert(report);
		var user = Meteor.users.findOne(this.userId);
		var sender = user &&
			user.emails &&
			user.emails[0] &&
			user.emails[0].address ||
			user.services &&
			user.services.google &&
			user.services.google.email ||
			"reports@dicecloud.com";
		var bodyText = "Report ID: " + id +
			"\nSeverity: " + report.severity +
			"\nType: " + report.type +
			"\n\n" + report.description;
		Email.send({
			from: sender,
			to: "stefan.zermatten@gmail.com",
			subject: "DiceCloud feedback - " + report.title,
			text: bodyText,
		});
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
