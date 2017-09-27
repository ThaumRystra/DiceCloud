Template.newUserStepper.onRendered(function(){
	let stepper = this.find("paper-stepper");
	this.autorun((c) => {
		var step = Session.get("newUserExperienceStep");
		var hasFeatures = Features.find({charId: this.data._id}).count() > 1
		if (step === 0 && hasFeatures){
			stepper.continue();
			c.stop();
		}
	});
	this.autorun((c) => {
		var step = Session.get("newUserExperienceStep");
		var hasEffect = !!Effects.find({
			charId: this.data._id,
			stat: "speed",
		}).count();
		if (step === 1 && hasEffect){
			stepper.continue();
			c.stop();
		}
	});
	this.autorun((c) => {
		var step = Session.get("newUserExperienceStep");
		if (step === 2 && Session.get("viewedSpeed")){
			stepper.continue();
			c.stop();
		}
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
});
