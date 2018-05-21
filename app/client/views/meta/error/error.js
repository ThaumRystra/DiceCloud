Template.error.onRendered(function(){
	const error = Session.get("error") || {};
	if (error.href) window.history.replaceState("", "", error.href);
});

Template.error.helpers({
	errorMessage: function(){
		const error = Session.get("error") || {};
		return error.reason;
	},
});

Template.error.events({
	"click .try-again": function(event, instance){
		window.location.reload();
	},
});
