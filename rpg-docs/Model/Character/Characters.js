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
		 new Effect("Level 1", 2)
	 ]
	},
	{name: "speed", 
	 add: [
		 new Effect("Base Speed", 30)
	 ]
	},
	{name: "armor", 
	 add: [
		 new Effect("Base Armor Class", 10), 
		 new Effect("Dexterity Modifier", "skillMod skills.dexterityArmor")
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
