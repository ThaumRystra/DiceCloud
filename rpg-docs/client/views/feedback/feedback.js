Template.feedback.events({
	"tap #sendButton": function(event, instance) {
		var report = {};
		report.title = instance.find("#feedbackTitle").value;
		report.severity = instance.find("#severity").value;
		report.type = instance.find(".typeMenu").selected;
		report.description = instance.find("#feedbackDescription").value;
		report.metaData = {
			url: window.location.href,
			session: _.pairs(Session.keys),
		};
		console.log(report);
		Meteor.call("insertReport", report);
	}
});
