var colorMap = {
	description: "indigo",
	personality: "blue",
	ideals: "light-blue",
	bonds: "cyan",
	flaws: "teal",
	backstory: "green"
}

Template.persona.helpers({
	characterDetails: function(){
		var char = Characters.findOne(this._id, {fields: {name: 1, gender: 1, alignment: 1, race:1}})
		char._id += "details";
		char.title = char.name;
		char.color = "deep-purple";
		return char;
	},
	characterField: function(field, title){
		var fieldSelector = {fields: {}};
		fieldSelector.fields[field] = 1;
		var char = Characters.findOne(this._id, fieldSelector);
		var color = colorMap[field];
		return {_id: char._id + field, title: title, field: field, color: color, body: char[field]};
	}
});

Template.persona.events({
	"tap .containerTop": function(event){
		if(this.field){
			var charId = Template.parentData()._id;
			GlobalUI.setDetail({
				template: "textDialog",
				data:     {charId: charId, field: this.field, title: this.title, color: this.color},
				heroId:   this._id
			});
		} else{
			this.charId = Template.parentData()._id;
			GlobalUI.setDetail({
				template: "personaDetailsDialog",
				data:     this,
				heroId:   this._id
			});
		}		
	}
});