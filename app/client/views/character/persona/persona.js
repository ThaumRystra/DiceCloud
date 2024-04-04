var colorMap = {
	description: "e",
	personality: "f",
	ideals: "g",
	bonds: "h",
	flaws: "i",
	backstory: "j",
};

var removeDuplicateProficiencies = function (proficiencies) {
	dict = {};
	proficiencies.forEach(function (prof) {
		if (prof.name in dict) { //if we have already gone over another proficiency for the same thing
			if (dict[prof.name].value < prof.value) {
				dict[prof.name] = prof; //then take the new one if it's higher, otherwise leave it
			}
		} else {
			dict[prof.name] = prof; //if it wasn't already there, store it
		}
	});
	profs = []
	_.forEach(dict, function (prof) {
		profs.push(prof);
	})
	return profs;
};

Template.persona.helpers({
	characterDetails: function () {
		var char = Characters.findOne(
			this._id,
			{ fields: { name: 1, gender: 1, alignment: 1, race: 1, picture: 1 } }
		);
		char.field = "details";
		char.title = char.name;
		char.color = "d";
		return char;
	},
	characterField: function (field, title) {
		var fieldSelector = { fields: {} };
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
	languages: function () {
		var profs = Proficiencies.find({
			charId: this._id,
			type: "language",
			removed: { $ne: true },
		});
		return removeDuplicateProficiencies(profs);
	},
});

Template.persona.events({
	"click .characterField": function (event) {
		if (this.field == "details") {
			this.charId = Template.parentData()._id;
			pushDialogStack({
				template: "personaDetailsDialog",
				data: this,
				element: event.currentTarget.parentElement,
			});
		} else {
			var template = "textDialog";
			if (this.field === "backstory") template = "backgroundDialog";
			var charId = Template.parentData()._id;
			pushDialogStack({
				template: template,
				data: {
					charId: charId,
					field: this.field,
					title: this.title,
					color: this.color,
				},
				element: event.currentTarget.parentElement,
			});
		}
	}
});
