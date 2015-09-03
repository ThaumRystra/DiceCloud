var checkWritePermission = function(charId) {
	if (!Meteor.call("canWriteCharacter", charId)){
		throw new Meteor.Error(
			"Access denied",
			"You do not have permission to edit the assets of this character"
		);
	}
};

var getCondition = function(conditionName) {
	//get condition from constant
	var condition = CONDITIONS[conditionName];
	//check that condition exists
	if (!condition) {
		throw new Meteor.Error(
			"Invalid condition",
			conditionName + " is not a known condition"
		);
	}
	return condition;
};

Meteor.methods({
	giveCondition: function(charId, conditionName) {
		checkWritePermission(charId);
		var condition = getCondition(conditionName);
		//create the buff
		var buff = _.extend(
			{charId: charId, type: "inate"}, condition.buff
		);

		//make sure the character doesn't already have the buff
		var existingBuffs = Buffs.find(_.clone(buff)).count();
		if (existingBuffs) return;
		//remove exclusive conditions
		_.each(condition.exclusiveConditions, function(exCond) {
			Meteor.call("removeCondition", charId, exCond);
		});
		//insert the buff
		var buffId = Buffs.insert(buff);
		//extend and insert each effect
		_.each(condition.effects, function(effect) {
			var newEffect = {
				stat: effect.stat,
				operation: effect.operation,
				value: effect.value,
				charId: charId,
				parent: {
					id: buffId,
					collection: "Buffs",
				},
				enabled: true,
			};
			//we know these effects are right,
			//skip after hooks, skip validation
			Effects.direct.insert(
				newEffect,
				{
					validate: false,
					filter: false,
					autoConvert: false,
					removeEmptyStrings: false,
				}
			);
		});
		//recurse for subConditions
		_.each(condition.subConditions, function(subCondition) {
			Meteor.call("giveCondition", charId, subCondition);
		});
	},
	removeCondition: function(charId, conditionName) {
		checkWritePermission(charId);
		var condition = getCondition(conditionName);
		//remove the buff
		var buff = _.extend(
			{charId: charId, type: "inate"}, condition.buff
		);
		Buffs.remove(buff);
		//dont remove the effects, they get removed automatically through parenting
	},
});

trackEncumbranceConditions = function(charId, templateInstance) {
	templateInstance.autorun(function() {
		//get weight
		var weight = 0;
		Containers.find(
			{charId: charId, isCarried: true},
			{fields: {weight: 1}}
		).forEach(function(container){
			weight += container.totalWeight();
		});
		Items.find(
			{charId: charId, "parent.id": charId},
			{fields: {weight : 1, quantity: 1}}
		).forEach(function(item){
			weight += item.totalWeight();
		});
		var character = Characters.findOne(
			charId,
			{fields: {"settings": 1}}
		);
		var strength = Characters.calculate.attributeValue(charId, "strength");
		var carryMultiplier = Characters.calculate
			.attributeValue(charId, "carryMultiplier");
		var give = function(condition) {
			Meteor.call("giveCondition", charId, condition);
		};
		var remove = function(condition) {
			Meteor.call("removeCondition", charId, condition);
		};
		//variant encumbrance rules
		if (weight > strength * 10 * carryMultiplier &&
			character.settings.useVariantEncumbrance) {
			give("encumbered2");
			remove("encumbered");
		} else if (weight > strength * 5 * carryMultiplier &&
				   character.settings.useVariantEncumbrance){
			give("encumbered");
			remove("encumbered2");
		} else {
			remove("encumbered");
			remove("encumbered2");
		}
		//normal encumbrance rules
		if (weight > strength * 30 * carryMultiplier &&
			character.settings.useStandardEncumbrance){
			give("encumbered4");
			remove("encumbered3");
		} else if (weight > strength * 15 * carryMultiplier &&
				   character.settings.useStandardEncumbrance) {
			give("encumbered3");
			remove("encumbered4");
		} else {
			remove("encumbered3");
			remove("encumbered4");
		}
	});
};

CONDITIONS = {
	//Conditions
	blind: {
		buff: {
			name: "Blind",
			description: "A blinded creature can’t see and automatically fails any ability check that requires sight.\n\nAttack rolls against the creature have advantage, and the creature’s attack rolls have disadvantage.",
		},
		effects: [
			{
				stat: "perception",
				operation: "conditional",
				calculation: "You fail your perception check if it requires sight",
			}
		],
	},

	deaf: {
		buff: {
			name: "Deaf",
			description: "A deafened creature can’t hear and automatically fails any ability check that requires hearing.",
		},
		effects: [
			{
				stat: "perception",
				operation: "conditional",
				calculation: "You fail your perception check if it requires hearing",
			}
		],
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
		effects: [
			{
				stat: "speed",
				operation: "max",
				value: 0,
			},
		],
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
			description: "A paralyzed creature is incapacitated and can’t move or speak.\n\nAttack rolls against the creature have advantage.\n\nAny attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
		},
		effects: [
			{
				stat: "speed",
				operation: "mul",
				value: 0,
			},
			{
				stat: "strengthSave",
				operation: "fail",
			},
			{
				stat: "dexteritySave",
				operation: "fail",
			},
		],
		subConditions: [
			"incapacitated",
		],
	},

	petrified: {
		buff: {
			name: "Petrified",
			description: "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.\n\nA petrified creature is incapacitated and can’t move or speak, and is unaware of its surroundings.\n\nAttack rolls against the creature have advantage.\n\nThe creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.",
		},
		effects: (function() {
			var effects = [
				{stat: "speed", operation: "max", value: 0},
				{stat: "strengthSave", operation: "fail"},
				{stat: "dexteritySave", operation: "fail"},
			];
			_.each(
				_.without(DAMAGE_MULTIPLIERS, "poisonMultiplier"),
				function(multiplier){
					effects.push({stat: multiplier, operation: "mul", value: 0.5});
				}
			);
			effects.push({stat: "poisonMultiplier", operation: "mul", value: 0});
		})(),
		subConditions: [
			"incapacitated",
		],
	},

	poisoned: {
		buff: {
			name: "Poisoned",
			description: "A poisoned creature has disadvantage on attack rolls and ability checks.",
		},
		effects: (function() {
			return _.map(SKILLS, function(skill) {
				return {stat: skill, operation: "disadvantage", value: 1};
			});
		})(),
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
		effects: [
			{
				stat: "speed",
				operation: "max",
				value: 0,
			},
			{
				stat: "dexteritySave",
				operation: "disadvantage",
				value: 1,
			},
		],
	},

	stunned: {
		buff: {
			name: "Stunned",
			description: "A stunned creature is incapacitated, can’t move, and can speak only falteringly\n\nThe creature automatically fails Strength and Dexterity saving throws.\n\nAttack rolls against the creature have advantage.",
		},
		effects: [
			{
				stat: "speed",
				operation: "max",
				value: 0,
			},
			{
				stat: "strengthSave",
				operation: "fail",
			},
			{
				stat: "dexteritySave",
				operation: "fail",
			},
		],
		subConditions: ["incapacitated"],
	},

	unconscious: {
		buff: {
			name: "Unconscious",
			description: "An unconscious creature is incapacitated, can’t move or speak, and is unaware of its surroundings.\n\nThe creature drops whatever it’s holding and falls prone.\n\nThe creature automatically fails Strength and Dexterity saving throws.\n\nAttack rolls against the creature have advantage.\n\nAny attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.",
		},
		subConditions: ["incapacitated", "prone"],
	},

	exhaustion1: {
		buff: {
			name: "Exhaustion - 1",
			description: "Disadvantage on ability checks\n\nFinishing a long rest reduces a creature’s exhaustion level by 1, provided that the creature has also ingested some food and drink.",
		},
		effects: (function() {
			return _.map(SKILLS, function(skill) {
				return {stat: skill, operation: "disadvantage", value: 1};
			});
		})(),
	},
	exhaustion2: {
		buff: {
			name: "Exhaustion - 2",
			description: "Speed halved",
		},
		effects: [
			{
				stat: "speed",
				operation: "mul",
				value: 0.5,
			}
		],
		subConditions: ["exhaustion1"],
	},
	exhaustion3: {
		buff: {
			name: "Exhaustion - 3",
			description: "Disadvantage on attack rolls and saving throws",
		},
		effects: (function() {
			return _.map(SAVES, function(skill) {
				return {stat: skill, operation: "disadvantage", value: 1};
			});
		})(),
		subConditions: ["exhaustion2"],
	},
	exhaustion4: {
		buff: {
			name: "Exhaustion - 4",
			description: "Hit point maximum halved",
		},
		effects: [
			{
				stat: "hitPoints",
				operation: "mul",
				value: 0.5,
			}
		],
		subConditions: ["exhaustion3"],
	},
	exhaustion5: {
		buff: {
			name: "Exhaustion - 5",
			description: "Speed reduced to 0",
		},
		effects: [
			{
				stat: "speed",
				operation: "max",
				value: 0,
			}
		],
		subConditions: ["exhaustion4"],
	},
	exhaustion6: {
		buff: {
			name: "Exhaustion - 6",
			description: "You have died of exhaustion",
		},
		effects: [
			{
				stat: "hitPoints",
				operation: "max",
				value: 0,
			}
		],
		subConditions: ["exhaustion5"],
	},
	encumbered: {
		buff: {
			name: "Encumbered",
			description: "Encumbered characters move 10 feet slower.",
		},
		effects: [
			{stat: "speed", operation: "add", value: -10}
		],
	},
	encumbered2: {
		buff: {
			name: "Heavily encumbered",
			description: "Heavily encumbered characters move 20 feet slower and have disadvantage on ability checks, attack rolls, and saving thows that use Strength, Dexterity, or Constitution.",
		},
		effects: [
			{stat: "speed", operation: "add", value: -20},
			{stat: "strengthSave", operation: "disadvantage", value: 1},
			{stat: "dexteritySave", operation: "disadvantage", value: 1},
			{stat: "constitutionSave", operation: "disadvantage", value: 1},
			{stat: "athletics", operation: "disadvantage", value: 1},
			{stat: "acrobatics", operation: "disadvantage", value: 1},
			{stat: "sleightOfHand", operation: "disadvantage", value: 1},
			{stat: "stealth", operation: "disadvantage", value: 1},
			{stat: "initiative", operation: "disadvantage", value: 1},
		],
	},
	encumbered3: {
		buff: {
			name: "Over encumbered",
			description: "Characters that can only just lift, push or drag their current load move at 5 feet.",
		},
		effects: [
			{stat: "speed", operation: "max", value: 5},
		],
	},
	encumbered4: {
		buff: {
			name: "Can't move load",
			description: "Characters attempting to carry more than what they can lift, push, or drag can't move.",
		},
		effects: [
			{stat: "speed", operation: "max", value: 0},
		],
	},
};
