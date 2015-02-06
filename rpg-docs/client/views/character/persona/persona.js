Template.persona.helpers({
	characterDetails: function(){
		var char = Characters.findOne(this._id, {fields: {name: 1, gender: 1, alignment: 1, race:1}})
		char._id += "details";
		char.title = char.name;
		return char;
	},
	characterField: function(field, title){
		var fieldSelector = {fields: {}};
		fieldSelector.fields[field] = 1;
		var char = Characters.findOne(this._id, fieldSelector);
		console.log("body is ", char[field])
		return {_id: char._id + field, title: title, field: field, body: char[field]};
	}
});

Template.persona.events({
	"tap .containerTop": function(event){
		if(this.field){
			var charId = Template.parentData()._id;
			GlobalUI.setDetail({
				template: "textDialog",
				data:     {charId: charId, field: this.field, title: this.title},
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