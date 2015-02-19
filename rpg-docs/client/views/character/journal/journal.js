Template.journal.helpers({
	notes: function(){
		return Notes.find({charId: this._id}, {sort: {color: 1, name: 1}});
	}
});

Template.journal.events({
	"tap .containerTop": function(event){
		GlobalUI.setDetail({
			template: "noteDialog",
			data:     {noteId: this._id, charId: this.charId},
			heroId:   this._id
		});
	},
	"tap #addNote": function(event){
		var charId = this.charId;
		Notes.insert({
			name: "New Note", 
			charId: this._id
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
		var charId = this.charId;
		var listId = this.listId;
		throw new Error("not implemented")/*
		Spells.insert({
			name: "New Spell", 
			charId: this._id,
			listId: SpellLists.findOne({charId: this._id})._id
		}, function(error, id){
			if(!error){
				GlobalUI.setDetail({
					template: "spellDialog",
					data:     {spellId: id, charId: charId, listId: listId},
					heroId:   id
				});
			}
		});*/
	}
});
