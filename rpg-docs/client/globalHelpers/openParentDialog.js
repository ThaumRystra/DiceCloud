openParentDialog = function({
	parent, charId, element, returnElement, callback,
}) {
	let template;
	let data;
	if (parent.collection === "Characters" && parent.group === "racial") {
		template = "raceDialog";
		data = {charId: parent.id};
	} else if (parent.collection === "Features") {
		template = "featureDialog";
		data = {featureId: parent.id};
	} else if (parent.collection === "Classes") {
		template = "classDialog";
		data = {classId: parent.id};
	} else if (parent.collection === "Items") {
		template = "itemDialog";
		data = {itemId: parent.id};
	} else if (parent.collection === "Spells") {
		template = "spellDialog";
		data = {spellId: parent.id};
	} else if (parent.collection === "Buffs") {
		template = "buffDialog";
		data = {buffId: parent.id};
	}
	pushDialogStack({template, data, element, returnElement, callback});
};
