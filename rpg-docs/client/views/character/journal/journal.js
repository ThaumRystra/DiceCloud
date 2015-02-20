Template.journal.created = function(){
	var self = this;
	self.experiencesLimit = new ReactiveVar(self.data.settings && self.data.settings.experiencesInc || 10);
};

Template.journal.helpers({
	notes: function(){
		return Notes.find({charId: this._id}, {sort: {color: 1, name: 1}});
	},
	experiences: function(){
		return Experiences.find({charId: this._id}, {sort: {dateAdded: -1}, limit: Template.instance().experiencesLimit.get()});
	},
	notMoreExperiences: function(){
		return Experiences.find({charId: this._id}).count() < Template.instance().experiencesLimit.get();
	},
	cantCollapse: function(){
		return Template.instance().experiencesLimit.get() <= (this.settings && this.settings.experiencesInc || 10);
	},
	moreExperiencesOrCollapse: function(){
		return (!(Experiences.find({charId: this._id}).count() < Template.instance().experiencesLimit.get())) ||
			Template.instance().experiencesLimit.get() > (this.settings && this.settings.experiencesInc || 10);
	}
});

Template.journal.events({
	"tap .noteTop": function(event){
		GlobalUI.setDetail({
			template: "noteDialog",
			data:     {noteId: this._id, charId: this.charId},
			heroId:   this._id
		});
	},
	"tap .experience": function(event){
		GlobalUI.setDetail({
			template: "experienceDialog",
			data: {experienceId: this._id, charId: this.charId},
			heroId: this._id
		});
	},
	"tap #addNote": function(event){
		var charId = this._id;
		Notes.insert({
			name: "New Note", 
			charId: charId
		}, function(error, id){
			if(!error){
				GlobalUI.setDetail({
					template: "noteDialog",
					data:     {noteId: id, charId: charId},
					heroId:   id
				});
			}
		});
	},
	"tap #addXP": function(event){
		var charId = this._id;
		Experiences.insert({
			charId: charId
		}, function(error, id){
			if(!error){
				GlobalUI.setDetail({
					template: "experienceDialog",
					data: {experienceId: id, charId: charId},
					heroId: id
				});
			}
		})
	},
	"tap #moreExperiences": function(event){
		var inst = Template.instance();
		inst.experiencesLimit.set(inst.experiencesLimit.get() + (this.settings && this.settings.experiencesInc || 10));
	},
	"tap #lessExperiences": function(event){
		var inst = Template.instance();
		inst.experiencesLimit.set(this.settings && this.settings.experiencesInc || 10);
		//scroll to the top of the div
		inst.$(".scroll-y").animate({
			scrollTop: inst.$(".scroll-y").scrollTop() + inst.$(".experiencesCard").position().top - 8
		}, 300);
		//HACK giggle the columns :( to workaround chrome bug that stops .containers height from updating
		var cs = inst.$(".containers").removeClass("containers");
		_.defer(function(){cs.addClass("containers")});
	}
});
