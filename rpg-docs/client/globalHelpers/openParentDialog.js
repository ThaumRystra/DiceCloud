openParentDialog = function(parent, charId, heroId) {
	var detail;
	if (parent.collection === "Characters" && parent.group === "racial") {
		detail = {
			template: "raceDialog",
			data: {charId: parent.id},
		};
	} else if (parent.collection === "Features") {
		detail = {
			template: "featureDialog",
			data:     {featureId: parent.id},
		};
	} else if (parent.collection === "Classes") {
		detail = {
			template: "classDialog",
			data: {classId: parent.id},
		};
	} else if (parent.collection === "Items") {
		detail = {
			template: "itemDialog",
			data:     {itemId: parent.id},
		};
	} else if (parent.collection === "Spells") {
		detail = {
			template: "spellDialog",
			data:     {spellId: parent.id},
		};
	}
	detail.heroId = heroId;
	detail.charId = charId;
	GlobalUI.setDetail(detail);
};
