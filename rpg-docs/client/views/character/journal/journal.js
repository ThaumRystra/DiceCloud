Template.journal.created = function(){
	var self = this;
	self.experiencesLimit = new ReactiveVar(
		self.data.settings && self.data.settings.experiencesInc || 10
	);
};

Template.journal.helpers({
	notes: function(){
		return Notes.find({charId: this._id}, {sort: {color: 1, name: 1}});
	},
	experiences: function(){
		return Experiences.find(
			{charId: this._id},
			{
				sort: {dateAdded: -1},
				limit: Template.instance().experiencesLimit.get(),
			}
		);
	},
	notMoreExperiences: function(){
		return Experiences.find(
			{charId: this._id}
		).count() < Template.instance().experiencesLimit.get();
	},
	cantCollapse: function(){
		return Template.instance().experiencesLimit.get() <=
			(this.settings && this.settings.experiencesInc || 10);
	},
	moreExperiencesOrCollapse: function(){
		var allShown = Experiences.find({charId: this._id}).count() <
			Template.instance().experiencesLimit.get();
		var canCollapse = Template.instance().experiencesLimit.get() >
			(this.settings && this.settings.experiencesInc || 10);
		return !allShown || canCollapse;
	},
	classes: function(){
		return Classes.find({charId: this._id}, {sort: {createdAt: 1}});
	},
	levels: function(charId){
		return Levels.find({charId: charId, classId: this._id}, {sort: {value: 1}});
	},
	nextLevelXP: function(){
		var currentLevel = this.level();
		if (currentLevel < 20){
			return XP_TABLE[currentLevel];
		}
	},
	race: function(){
		var char = Characters.findOne(this._id, {fields: {race: 1}});
		return char && char.race;
	},
});

Template.journal.events({
	"tap .noteTop": function(event){
		GlobalUI.setDetail({
			template: "noteDialog",
			data:     {noteId: this._id, charId: this.charId},
			heroId:   this._id,
		});
	},
	"tap .experience": function(event){
		GlobalUI.setDetail({
			template: "experienceDialog",
			data: {experienceId: this._id, charId: this.charId},
			heroId: this._id,
		});
	},
	"tap .class": function(event){
		GlobalUI.setDetail({
			template: "classDialog",
			data: {classId: this._id, charId: this.charId},
			heroId: this._id,
		});
	},
	"tap .race": function(event){
		GlobalUI.setDetail({
			template: "raceDialog",
			data: {charId: this._id},
			heroId: this._id + "race",
		});
	},
	"tap #addNote": function(event){
		var charId = this._id;
		Notes.insert({
			name: "New Note",
			charId: charId,
		}, function(error, id){
			if (!error){
				GlobalUI.setDetail({
					template: "noteDialog",
					data:     {noteId: id, charId: charId, startEditing: true},
					heroId:   id,
				});
			}
		});
	},
	"tap #addXP": function(event){
		var charId = this._id;
		Experiences.insert({
			charId: charId
		}, function(error, id){
			if (!error){
				GlobalUI.setDetail({
					template: "experienceDialog",
					data: {experienceId: id, charId: charId, startEditing: true},
					heroId: id,
				});
			}
		});
	},
	"tap #addClassButton":function(event){
		var charId = this._id;
		Classes.insert({
			charId: charId,
			name: "new Class",
			level: 1,
		}, function(error, id){
			if (!error){
				GlobalUI.setDetail({
					template: "classDialog",
					data: {classId: id, charId: charId, startEditing: true},
					heroId: id,
				});
			}
		});
	},
	"tap #moreExperiences": function(event){
		var inst = Template.instance();
		inst.experiencesLimit.set(
			inst.experiencesLimit.get() +
			(this.settings && this.settings.experiencesInc || 10)
		);
	},
	"tap #lessExperiences": function(event){
		var inst = Template.instance();
		inst.experiencesLimit.set(
			this.settings && this.settings.experiencesInc || 10
		);
		//scroll to the top of the div
		inst.$(".scroll-y").animate({
			scrollTop: (
				inst.$(".scroll-y").scrollTop() +
				inst.$(".experiencesCard").position().top -
				8
			)
		}, 300);
		//HACK giggle the columns :( to workaround chrome bug that stops .containers height from updating
		var cs = inst.$(".containers").removeClass("containers");
		_.defer(function(){cs.addClass("containers");});
	},
});
