Template.feedback.onCreated(function() {
	this.title = new ReactiveVar("");
	this.description = new ReactiveVar("");
});

Template.feedback.helpers({
	invalid: function() {
		var inst = Template.instance();
		return !inst.title.get() ||
			!inst.description.get();
	}
});

Template.feedback.events({
	"input #feedbackTitle": function(event, instance) {
		instance.title.set(instance.find("#feedbackTitle").value);
	},
	"input #feedbackDescription": function(event, instance) {
		instance.description.set(instance.find("#feedbackDescription").value);
	},
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
		Meteor.call("insertReport", report);
	}
});
