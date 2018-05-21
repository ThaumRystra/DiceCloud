Template.conditionLibraryDialog.onCreated(function(){
	this.selectedCondition = new ReactiveVar();
});

Template.conditionLibraryDialog.helpers({
	conditions: function(){
		return Object.keys(LIBRARY_CONDITIONS)
	},
	isSelected(condition){
		const selected = Template.instance().selectedCondition.get();
		return selected && selected === condition;
	},
});

Template.conditionLibraryDialog.events({
	"click .cancelButton": function(event, template){
		popDialogStack();
	},
	"click .okButton": function(event, template){
		popDialogStack(template.selectedCondition.get());
	},
	"click .library-condition": function(event, template){
		template.selectedCondition.set(this.condition);
	},
	"click #backButton": function(event, template){
		popDialogStack();
	},
});

Template.libraryCondition.helpers({
	conditionName: function(name){
		return LIBRARY_CONDITIONS[name].buff.name;
	},
})


LIBRARY_CONDITIONS = {
	//Conditions
	blind: {
		buff: {
			name: "Blind",
			description: "A blinded creature can’t see and automatically fails any ability check that requires sight.\n\nAttack rolls against the creature have advantage, and the creature’s attack rolls have disadvantage.",
		},
	},

	deaf: {
		buff: {
			name: "Deaf",
			description: "A deafened creature can’t hear and automatically fails any ability check that requires hearing.",
		},
	},

	frightened: {
		buff: {
			name: "Frightened",
			description: "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.\n\nThe creature can’t willingly move closer to the source of its fear.",
		}
	},

	grappled: {
		buff:{
			name: "Grappled",
			description: "A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.\n\nThe condition ends if the grappler is incapacitated.\n\nThe condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect, such as when a creature is hurled away by the thunder wave spell.",
		},
	},

	incapacitated: {
		buff: {
			name: "Incapacitated",
			description: "An incapacitated creature can’t take actions or reactions.",
		}
	},

	invisible: {
		buff: {
			name: "Invisible",
			description: "An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature’s location can be detected by any noise it makes or any tracks it leaves.\n\nAttack rolls against the creature have disadvantage, and the creature’s attack rolls have advantage.",
		}
	},

	paralyzed: {
		buff: {
			name: "Paralyzed",
			description: "A paralyzed creature is **incapacitated** and can’t move or speak.\n\nAttack rolls against the creature have advantage.\n\nAny attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
		},
	},

	petrified: {
		buff: {
			name: "Petrified",
			description: "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.\n\nA petrified creature is **incapacitated** and can’t move or speak, and is unaware of its surroundings.\n\nAttack rolls against the creature have advantage.\n\nThe creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.",
		},
	},

	poisoned: {
		buff: {
			name: "Poisoned",
			description: "A poisoned creature has disadvantage on attack rolls and ability checks.",
		},
	},

	prone: {
		buff: {
			name: "Prone",
			description: "A prone creature’s only movement option is to crawl, unless it stands up and thereby ends the condition.\n\nThe creature has disadvantage on attack rolls.\n\nAn attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage.",
		}
	},

	restrained: {
		buff: {
			name: "Restrained",
			description: "A restrained creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.\n\nAttack rolls against the creature have advantage, and the creature’s attack rolls have disadvantage.\n\nThe creature has disadvantage on Dexterity saving throws.",
		},
	},

	stunned: {
		buff: {
			name: "Stunned",
			description: "A stunned creature is **incapacitated**, can’t move, and can speak only falteringly\n\nThe creature automatically fails Strength and Dexterity saving throws.\n\nAttack rolls against the creature have advantage.",
		},
	},

	unconscious: {
		buff: {
			name: "Unconscious",
			description: "An unconscious creature is **incapacitated**, can’t move or speak, and is unaware of its surroundings.\n\nThe creature drops whatever it’s holding and falls **prone**.\n\nThe creature automatically fails Strength and Dexterity saving throws.\n\nAttack rolls against the creature have advantage.\n\nAny attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
		},
	},

	exhaustion1: {
		buff: {
			name: "Exhaustion - 1",
			description: "Disadvantage on ability checks\n\nFinishing a long rest reduces a creature’s exhaustion level by 1, provided that the creature has also ingested some food and drink.",
		},
	},
	exhaustion2: {
		buff: {
			name: "Exhaustion - 2",
			description: "Speed halved",
		},
	},
	exhaustion3: {
		buff: {
			name: "Exhaustion - 3",
			description: "Disadvantage on attack rolls and saving throws",
		},
	},
	exhaustion4: {
		buff: {
			name: "Exhaustion - 4",
			description: "Hit point maximum halved",
		},
	},
	exhaustion5: {
		buff: {
			name: "Exhaustion - 5",
			description: "Speed reduced to 0",
		},
	},
	exhaustion6: {
		buff: {
			name: "Exhaustion - 6",
			description: "You have died of exhaustion",
		},
	},
};
