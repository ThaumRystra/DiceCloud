Template.printedProficiency.helpers({
	profIcon: function(){
		var prof = this.value;
		if (prof > 0 && prof < 1) return "image:brightness-2";
		if (prof === 1) return "image:brightness-1";
		if (prof > 1) return "av:album";
		return "radio-button-off";
	},
	getName: function(){
		if (this.type === "skill") return skills[this.name];
		if (this.type === "save") return saves[this.name];
		return this.name;
	},
});

Template.printedProficiency.events({
	"click .proficiency": function(event, instance){
		if (this.parent.collection == "Characters") {
			if (this.parent.group == "background") {
				pushDialogStack({
					template: "backgroundDialog",
					data: {
						"charId": this.charId,
						"field":"background",
						"title":"Background",
						"color":"j",
					},
					element: event.currentTarget,
				})
				return;
			}
		}

		openParentDialog({
			parent: this.parent,
			charId: this.charId,
			element: event.currentTarget,
		});
	}
});
