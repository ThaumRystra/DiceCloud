var colorMap = {
	description: "e",
	personality: "f",
	ideals: "g",
	bonds: "h",
	flaws: "i",
	backstory: "j",
};

Template.persona.helpers({
	characterDetails: function(){
		var char = Characters.findOne(
			this._id,
			{fields: {name: 1, gender: 1, alignment: 1, race:1, picture: 1}}
		);
		char.field = "details";
		char.title = char.name;
		char.color = "d";
		char.startEditing = true;
		return char;
	},
	characterField: function(field, title){
		var fieldSelector = {fields: {}};
		fieldSelector.fields[field] = 1;
		var char = Characters.findOne(this._id, fieldSelector);
		var color = colorMap[field];
		return {
			_id: char._id,
			title: title,
			field: field,
			color: color,
			body: char[field],
			topClass: "characterField",
		};
	},
	languages: function(){
		return Proficiencies.find({charId: this._id, type: "language"});
	},
});

Template.persona.events({
	"tap .characterField": function(event){
		if (this.field == "details"){
			this.charId = Template.parentData()._id;
			GlobalUI.setDetail({
				template: "personaDetailsDialog",
				data:     this,
				heroId:   this._id + this.field,
			});
		} else {
			var template = "textDialog";
			if (this.field === "backstory") template = "backgroundDialog";
			var charId = Template.parentData()._id;
			GlobalUI.setDetail({
				template: template,
				data: {
					charId: charId,
					field: this.field,
					title: this.title,
					color: this.color,
					startEditing: true,
				},
				heroId:   this._id + this.field,
			});
		}
	}
});
