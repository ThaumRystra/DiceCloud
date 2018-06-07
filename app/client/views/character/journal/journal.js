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
		var currentLevel = Characters.calculate.level(this._id);
		if (currentLevel < 20){
			return XP_TABLE[currentLevel];
		}
	},
	race: function(){
		var char = Characters.findOne(this._id, {fields: {race: 1}});
		return char && char.race;
	},
	shouldRaceBounce: function(){
		return Session.get("newUserExperienceStep") === 1;
	},
});

Template.journal.events({
	"click .noteTop": function(event){
		pushDialogStack({
			template: "noteDialog",
			data:     {noteId: this._id, charId: this.charId},
			element:  event.currentTarget.parentElement,
		});
	},
	"click .experience": function(event){
		pushDialogStack({
			template: "experienceDialog",
			data: {experienceId: this._id, charId: this.charId},
			element: event.currentTarget,
		});
	},
	"click .class": function(event){
		pushDialogStack({
			template: "classDialog",
			data: {classId: this._id, charId: this.charId},
			element: event.currentTarget,
		});
	},
	"click .race": function(event){
		pushDialogStack({
			template: "raceDialog",
			data: {charId: this._id},
			element: event.currentTarget,
		});
	},
	"click #addNote": function(event, instance){
		var charId = this._id;
		var noteId = Notes.insert({
			name: "New Note",
			charId: charId,
		});
		pushDialogStack({
			template: "noteDialog",
			data:     {noteId: noteId, charId: charId, startEditing: true},
			element:  event.currentTarget,
			returnElement: () => instance.find(`.note[data-id='${noteId}']`),
		});
	},
	"click #addXP": function(event, instance){
		var charId = this._id;
		var expId = Experiences.insert({
			charId: charId
		});
		pushDialogStack({
			template: "experienceDialog",
			data: {experienceId: expId, charId: charId, startEditing: true},
			element: event.currentTarget,
			returnElement: () => instance.find(`.experience[data-id='${expId}']`),
		});
	},
	"click #addClassButton":function(event, instance){
		var charId = this._id;
		var classId = Classes.insert({
			charId: charId,
			name: "new Class",
			level: 1,
		});
		pushDialogStack({
			template: "classDialog",
			data: {classId: classId, charId: charId, startEditing: true},
			element: event.currentTarget,
			returnElement: () => instance.find(`.class[data-id='${classId}']`),
		});
	},
	"click #moreExperiences": function(event, instance){
		instance.experiencesLimit.set(
			instance.experiencesLimit.get() +
			(this.settings && this.settings.experiencesInc || 10)
		);
	},
	"click #lessExperiences": function(event, instance){
		instance.experiencesLimit.set(
			this.settings && this.settings.experiencesInc || 10
		);
		// Scroll to the top of the div
		instance.$(".scroll-y").animate({
			scrollTop: (
				instance.$(".scroll-y").scrollTop() +
				instance.$(".experiencesCard").position().top -
				8
			)
		}, 300);
		// HACK jiggle the columns :( to workaround chrome bug that stops .containers height from updating
		var cs = instance.$(".containers").removeClass("containers");
		_.defer(function(){cs.addClass("containers");});
	},
});
