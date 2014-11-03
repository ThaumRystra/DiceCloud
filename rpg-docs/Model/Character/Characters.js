//set up the collection for characters
Characters = new Meteor.Collection("characters", {
	//transform function alters the object returned by the database
	transform: function (doc) {
		//extend character with its protoypal functions
		var newInstance = Object.create(protoCharacter);
		doc = _.extend(newInstance, doc);

		return  doc;
	}
});

//Attributes are numerical values
Attribute = function(base){
	this.base = base; //the unmodified value of the attribute
	//effects of the form {name: "Ring of Protection", value: 1}
	this.add = []; //bonuses added to the attribute
	this.mul = []; //multipliers to the attribute (after adding bonuses)
	this.min = []; //effects setting the minimum value of the attribute
	this.max = []; //effects setting the maximum value of the attribute
	this.conditional = []; //conditional modifiers
}

var attributes = [
	{name: "strength"}, 
	{name: "dexterity"}, 
	{name: "constitution"}, 
	{name: "intelligence"},
	{name: "wisdom"}, 
	{name: "charisma"},
	{name: "hitPoints"},
	{name: "experience"},
	{name: "proficiencyBonus", 
	 add: [
		 {name: "Level 1", value: 2}
	 ]
	},
	{name: "speed", 
	 add: [
		 {name: "Base Speed", value: 30}
	 ]
	},
	{name: "armor", 
	 add: [
		 {name: "Base Armor Class", value: 10}, 
		 {name: "Dexterity Modifier", value: "skillMod skills.dexterityArmor"}
	 ]
	},
	{name: "weight"},
	{name: "weightCarried"},
	{name: "age"},
	{name: "ageRate"},
	{name: "level1SpellSlots"},
	{name: "level2SpellSlots"},
	{name: "level3SpellSlots"},
	{name: "level4SpellSlots"},
	{name: "level5SpellSlots"},
	{name: "level6SpellSlots"},
	{name: "level7SpellSlots"},
	{name: "level8SpellSlots"},
	{name: "level9SpellSlots"},
	{name: "ki"},
	{name: "sorceryPoints"},
	{name: "rages"}
];

//Skills are bonuses to rolls: "+2" etc.
//They are based off of some ability
Skill = function(ability){
	//proficiencies of the form {name: "Jack of all Trades", value: 0.5}
	//only the highest is used
	this.proficiency = []; 
	//ability name that this skill uses as base for roll
	this.ability = ability;
	this.add = [];
	this.mul = [];
	this.min = [];
	this.max = [];
	this.advantage = []; //effects granting advantage
	this.disadvantage = [];
	this.passiveAdd = []; //only added to passive checks
	this.fail = []; //all checks are failed
	this.conditional = []; //conditional modifiers
}

var skills = [
	{skill: "strengthSave", ability: "strength"},
	{skill: "dexteritySave", ability: "dexterity"},
	{skill: "constitutionSave", ability: "constitution"},
	{skill: "intelligenceSave", ability: "intelligence"},
	{skill: "wisdomSave", ability: "wisdom"},
	{skill: "charismaSave", ability: "charisma"},

	{skill: "acrobatics", ability: "dexterity"}, 
	{skill: "animalHandling", ability: "wisdom"}, 
	{skill: "arcana",ability: "intelligence"}, 
	{skill: "athletics", ability: "strength"}, 
	{skill: "deception", ability: "charisma"}, 
	{skill: "history", ability: "intelligence"}, 
	{skill: "insight", ability: "wisdom"}, 
	{skill: "intimidation", ability: "charisma"}, 
	{skill: "investigation", ability: "intelligence"}, 
	{skill: "medicine", ability: "wisdom"}, 
	{skill: "nature", ability: "intelligence"}, 
	{skill: "perception", ability: "wisdom"}, 
	{skill: "performance", ability: "charisma"}, 
	{skill: "persuasion", ability: "charisma"}, 
	{skill: "religion", ability: "intelligence"}, 
	{skill: "sleightOfHand", ability: "dexterity"}, 
	{skill: "stealth", ability: "dexterity"}, 
	{skill: "survival", ability: "wisdom"},

	{skill: "initiative", ability: "dexterity"},

	{skill: "strengthAttack", ability: "strength", proficiency: 1},
	{skill: "dexterityAttack", ability: "dexterity", proficiency: 1},
	{skill: "constitutionAttack", ability: "constitution", proficiency: 1},
	{skill: "intelligenceAttack", ability: "intelligence", proficiency: 1},
	{skill: "wisdomAttack", ability: "wisdom", proficiency: 1},
	{skill: "charismaAttack", ability: "charisma", proficiency: 1},
	{skill: "rangedAttack", ability: "dexterity", proficiency: 1},

	{skill: "dexterityArmor", ability: "dexterity"}

];

//Plain text fields for the character
var strings = [
	"name",
	"alignment", 
	"gender", 
	"race",
	"description",
	"personality",
	"ideals",
	"bonds",
	"flaws"
];

//Data structure for the character
//no functions can be added to this constructor
Character = function(owner){
	//attributes
	this.attributes = {};
	for(var i = 0, l = attributes.length; i < l; i++){
		this.attributes[attributes[i].name] = new Attribute(0);
		this.attributes[attributes[i].name].add = attributes[i].add || [];
		this.attributes[attributes[i].name].mul = attributes[i].mul || [];
		this.attributes[attributes[i].name].min = attributes[i].min || [];
		this.attributes[attributes[i].name].max = attributes[i].max || [];
	}

	//skills
	this.skills = {};
	for(var i = 0, l = skills.length; i < l; i++){
		this.skills[skills[i].skill] = new Skill(skills[i].ability);
		if(skills[i].proficiency)
			this.skills[skills[i].skill].proficiency.push(skills[i].proficiency);
	}

	this.deathSave = {
		success : 0,
		fail: 0
	};

	this.hitDice = [];

	this.weaponProficiencies = [];
	this.toolProficiencies = [];
	this.languages = [];

	this.features = [];

	this.spells = [];

	this.classes = [];

	this.vulnerability = {};
	for(var i = 0, l = DamageTypes.length; i < l; i++){
		this.vulnerability[DamageTypes[i]] = new Attribute(1);
		this.vulnerability[DamageTypes[i]].min.push({name: "Resistance doesn't stack", value: 0.5});
		this.vulnerability[DamageTypes[i]].max.push({name: "Vulnerability doesn't stack", value: 2});
	}

	//admin
	this.owner = owner;
	this.readers = [];
	this.writers = [];
}

//functions and calculated values go here
var protoCharacter = {
	attributeValue: function(attribute){
		if (attribute === undefined) return;
		//base value
		var value = attribute.base;

		//add all values in add array
		for(var i = 0, l = attribute.add.length; i < l; i++){
			var add = pop(attribute.add[i].value, this);
			value += add ;
		}

		//multiply all values in mul array
		for(var i = 0, l = attribute.mul.length; i < l; i++){
			var mul = pop(attribute.mul[i], this);
			value *= mul;
		}

		//largest min
		for(var i = 0, l = attribute.min.length; i < l; i++){
			var min = pop(attribute.min[i], this);
			value = value > min? value : min;
		}

		//smallest max
		for(var i = 0, l = attribute.max.length; i < l; i++){
			var max = pop(attribute.max[i], this);
			value = value < max? value : max;
		}

		return value;
	},

	skillMod: function(skill){
		//get the final value of the ability score
		var ability = this.attributeValue(this.attributes[skill.ability]);

		//base modifier
		var mod = +getMod(ability)

		//multiply proficiency bonus by largest value in proficiency array
		var prof = 0;
		for(var i = 0, l = skill.proficiency.length; i < l; i++){
			var newProf = pop(skill.proficiency[i].value, this);
			if (newProf > prof){
				prof = newProf;
			}
		}
		//add multiplied proficiency bonus to modifier
		mod += prof * this.attributeValue(this.attributes.proficiencyBonus);

		//add all values in add array
		for(var i = 0, l = skill.add.length; i < l; i++){
			mod += pop(skill.add[i].value, this);
		}

		//multiply all values in mul array
		for(var i = 0, l = skill.mul.length; i < l; i++){
			mod *= pop(skill.mul[i].value, this);
		}

		//largest min
		for(var i = 0, l = skill.min.length; i < l; i++){
			var min = pop(skill.min[i], this);
			mod = mod > min? mod : min;
		}

		//smallest max
		for(var i = 0, l = skill.max.length; i < l; i++){
			var max = pop(skill.max[i], this);
			mod = mod < max? mod : max;
		}

		return signedString(mod);
	},

	passiveSkill: function(skill){
		var mod = +this.skillMod(skill);
		var value = 10 + mod;
		for(var i = 0, l = skill.passiveAdd.length; i < l; i++){
			value += pop(skill.passiveAdd[i].value, this);
		}
		return value;
		//TODO decide whether (dis)advantage gives (-)+5 to passive checks
	},

	abilityMod: function(attribute){
		return signedString(getMod(this.attributeValue(attribute)));
	},

	passiveAbility: function(attribute){
		var mod = +getMod(this.attributeValue(attribute));
		return 10 + mod;
	}
}

getMod = function(score){
	return Math.floor((score-10)/2);
}

signedString = function(number){
	return number > 0? "+" + number : "" + number;
}

// turns dot notation strings into keys of root
// argument formats:
// 157, anything -> 157
// "some.number", object -> object.some.number
// "some.function", object -> object.some.function()
// "some.function arg1 arg2", object -> object.some.function(arg1, arg2)
pop = function(input, root){

	if(typeof(input) === "string"){
		//we need root for this part
		if(root === undefined) return;

		//this is a likely to fail if the string is malformed
		try{
			//split over spaces
			var parts = input.split(" "); 

			//for each word
			for (var i = 0; i < parts.length; i++){
				//split over dots
				var str = parts[i].split(".");

				//start at root
				parts[i] = root;

				//for each word between dots
				for (var j = 0; j < str.length; j++){
					parts[i] = parts[i][str[j]];
				}
			}

			//pull the first word out, might be a function
			var func = parts.splice(0, 1)[0];

			//if it's a function, apply the arguments to it
			if(_.isFunction(func)) return +func.apply(root, parts);

			//if it's a number, return it
			if(!isNaN(func)) return +func;
		} catch (err) {
			//TODO pokemon catch statement is bad
			//"gotta catch em all"
			console.log(err);
			return;
		}
	}

	return +input;
}