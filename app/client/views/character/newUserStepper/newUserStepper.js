Template.newUserStepper.onRendered(function(){
	Session.set("newUserExperienceStep", 0);
	let stepper = this.find("paper-stepper");
	_.defer(() => {
		this.autorun((c) => {
			var step = Session.get("newUserExperienceStep");
			var hasFeatures = Features.find({charId: this.data._id}).count() > 1;
			if (step === 0 && hasFeatures){
				stepper.continue();
			}
		});
		this.autorun((c) => {
			var step = Session.get("newUserExperienceStep");
			var hasEffect = !!Effects.find({
				charId: this.data._id,
				stat: "speed",
				"parent.group": "racial",
				operation: "base",
				value: {$gt: 0},
			}).count();
			if (step === 1 && hasEffect){
				stepper.continue();
			}
		});
		this.autorun((c) => {
			var step = Session.get("newUserExperienceStep");
			if (step === 2 && Session.get("viewedSpeed")){
				Session.set("viewedSpeed", undefined);
				stepper.continue();
			}
		});
	});
});

Template.newUserStepper.events({
	"paper-stepper-progressed paper-stepper": function(event, template){
		const step = template.find("paper-stepper").selected;
		Session.set("newUserExperienceStep", step);
	},
	"paper-stepper-completed paper-stepper": function(event, template){
		Session.set("newUserExperienceStep", undefined);
		Session.set("showNewUserExperience", undefined);
		Characters.update(this._id, {$unset: {"settings.newUserExperience": 1}});
	},
	"click .done-button": function(event, instance){
		const stepper = instance.find("paper-stepper");
		stepper.continue();
	},
	"click .skip-button": function(event, instance){
		const stepper = instance.find("paper-stepper");
		stepper.continue();
	},
});

Template.stats.events({
	"click .stat-card": function(event, instance){
		var step = Session.get("newUserExperienceStep");
		if (this.stat === "speed" && step === 2){
			Session.set("viewedSpeed", true);
		}
	}
});
