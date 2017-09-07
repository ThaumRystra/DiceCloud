var saves = {
	strengthSave: "Strength Save",
	dexteritySave: "Dexterity Save",
	constitutionSave: "Constitution Save",
	intelligenceSave: "Intelligence Save",
	wisdomSave: "Wisdom Save",
	charismaSave: "Charisma Save",
	allSaves: "All Saves",
};

var skills = {
	acrobatics: "Acrobatics",
	animalHandling: "Animal Handling",
	arcana: "Arcana",
	athletics: "Athletics",
	deception: "Deception",
	history: "History",
	insight: "Insight",
	intimidation: "Intimidation",
	investigation: "Investigation",
	medicine: "Medicine",
	nature: "Nature",
	perception: "Perception",
	performance: "Performance",
	persuasion: "Persuasion",
	religion: "Religion",
	sleightOfHand: "Sleight of Hand",
	stealth: "Stealth",
	survival: "Survival",
	initiative: "Initiative",

	allSkills: "All Skills",
	strengthSkills: "All Strength Skills",
	dexteritySkills: "All Dexterity Skills",
	constitutionSkills: "All Constitution Skills",
	intelligenceSkills: "All Intelligence Skills",
	wisdomSkills: "All Wisdom Skills",
	charismaSkills: "All Charisma Skills",
};

Template.proficiencyView.helpers({
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
