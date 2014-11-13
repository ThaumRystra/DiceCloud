Schemas.Skill = new SimpleSchema({
	//attribute name that this skill used as base mod for roll
	ability: 		{ type: String, defaultValue: "" },
	//multiplied by profBonus and added to base mod
	//only highest value proficiency is used
	proficiency:	{ type: [Schemas.Effect], defaultValue: [] },
	//added to base mod
	add:			{ type: [Schemas.Effect], defaultValue: [] },
	//multiplied by base + adds
	mul:			{ type: [Schemas.Effect], defaultValue: [] },
	//lower bounds, highest used
	min:			{ type: [Schemas.Effect], defaultValue: [] },
	//upper bounds, lowest used
	max:			{ type: [Schemas.Effect], defaultValue: [] },
	//things giving advantage
	advantage:		{ type: [Schemas.Effect], defaultValue: [] }, 
	//things giving disadvantage
	disadvantage:	{ type: [Schemas.Effect], defaultValue: [] },
	//added to passive checks only
	passiveAdd: 	{ type: [Schemas.Effect], defaultValue: [] },
	//things causing all rolls to fail
	fail: 			{ type: [Schemas.Effect], defaultValue: [] },
	//things that only apply sometimes
	conditional: 	{ type: [Schemas.Effect], defaultValue: [] }
});

Schemas.Skills = new SimpleSchema({
	//saves
	strengthSave: 	{type: Schemas.Skill},
	"strengthSave.ability": 	{ type: String, defaultValue: "strength" },
	
	dexteritySave:	{type: Schemas.Skill},
	"dexteritySave.ability": 	{ type: String, defaultValue: "dexterity" },
	
	constitutionSave:{type: Schemas.Skill},
	"constitutionSave.ability":	{ type: String, defaultValue: "constitution" },
	
	intelligenceSave:{type: Schemas.Skill},
	"intelligenceSave.ability":	{ type: String, defaultValue: "intelligence" },
	
	wisdomSave:		{type: Schemas.Skill},
	"wisdomSave.ability":		{ type: String, defaultValue: "wisdom" },
	
	charismaSave:	{type: Schemas.Skill},
	"charismaSave.ability":		{ type: String, defaultValue: "charisma" },
	
	
	//skill skills
	acrobatics: 	{type: Schemas.Skill},
	"acrobatics.ability": 		{ type: String, defaultValue: "dexterity" },
	
	animalHandling: {type: Schemas.Skill},
	"animalHandling.ability":	{ type: String, defaultValue: "wisdom" },
	
	arcana: 		{type: Schemas.Skill},
	"arcana.ability": 			{ type: String, defaultValue: "intelligence" },
	
	athletics: 		{type: Schemas.Skill},
	"athletics.ability": 		{ type: String, defaultValue: "strength" },
	
	deception: 		{type: Schemas.Skill},
	"deception.ability": 		{ type: String, defaultValue: "charisma" },
	
	history: 		{type: Schemas.Skill},
	"history.ability": 			{ type: String, defaultValue: "intelligence" },
	
	insight:		{type: Schemas.Skill},
	"insight.ability":			{ type: String, defaultValue: "wisdom" },
	
	intimidation:	{type: Schemas.Skill},
	"intimidation.ability":		{ type: String, defaultValue: "charisma" },
	
	investigation:	{type: Schemas.Skill},
	"investigation.ability":	{ type: String, defaultValue: "intelligence" },
	
	medicine:		{type: Schemas.Skill},
	"medicine.ability": 		{ type: String, defaultValue: "wisdom" },
	
	nature:			{type: Schemas.Skill},
	"nature.ability": 			{ type: String, defaultValue: "intelligence" },
	
	perception:		{type: Schemas.Skill},
	"perception.ability": 		{ type: String, defaultValue: "wisdom" },
	
	performance:	{type: Schemas.Skill},
	"performance.ability": 		{ type: String, defaultValue: "charisma" },
	
	persuasion: 	{type: Schemas.Skill},
	"persuasion.ability": 		{ type: String, defaultValue: "charisma" },
	
	religion:		{type: Schemas.Skill},
	"religion.ability": 		{ type: String, defaultValue: "intelligence" },
	
	sleightOfHand:	{type: Schemas.Skill},
	"sleightOfHand.ability":	{ type: String, defaultValue: "dexterity" },
	
	stealth:		{type: Schemas.Skill},
	"stealth.ability": 			{ type: String, defaultValue: "dexterity" },
	
	survival:		{type: Schemas.Skill},
	"survival.ability": 		{ type: String, defaultValue: "wisdom" },

	
	//Mechanical Skills
	initiative: 		{type: Schemas.Skill},
	"initiative.ability":		{ type: String, defaultValue: "dexterity" },

	strengthAttack:		{type: Schemas.Skill},
	"strengthAttack.ability": 	{type: String,defaultValue: "strength"},
	"strengthAttack.proficiency": {
		type: [Schemas.Effect],
		defaultValue: [{_id: Random.id(),name: "Attack Proficiency",value: 1}]
	},

	dexterityAttack:	{type: Schemas.Skill},
	"dexterityAttack.ability":	{ type: String, defaultValue: "dexterity" },
	"dexterityAttack.proficiency": {
		type: [Schemas.Effect],
		defaultValue: [{_id: Random.id(),name: "Attack Proficiency",value: 1}]
	},

	constitutionAttack:	{type: Schemas.Skill},
	"constitutionAttack.ability":{ type: String, defaultValue: "constitution" },
	"constitutionAttack.proficiency": {
		type: [Schemas.Effect],
		defaultValue: [{_id: Random.id(),name: "Attack Proficiency",value: 1}]
	},

	intelligenceAttack:	{type: Schemas.Skill},
	"intelligenceAttack.ability":{ type: String, defaultValue: "intelligence" },
	"intelligenceAttack.proficiency": {
		type: [Schemas.Effect],
		defaultValue: [{_id: Random.id(),name: "Attack Proficiency",value: 1}]
	},

	wisdomAttack:		{type: Schemas.Skill},
	"wisdomAttack.ability":		{ type: String, defaultValue: "wisdom" },
	"wisdomAttack.proficiency": {
		type: [Schemas.Effect],
		defaultValue: [{_id: Random.id(),name: "Attack Proficiency",value: 1}]
	},

	charismaAttack:		{type: Schemas.Skill},
	"charismaAttack.ability":	{ type: String, defaultValue: "charisma" },
	"charismaAttack.proficiency": {
		type: [Schemas.Effect],
		defaultValue: [{_id: Random.id(),name: "Attack Proficiency",value: 1}]
	},

	rangedAttack:		{type: Schemas.Skill},
	"rangedAttack.ability":		{ type: String, defaultValue: "dexterity" },
	"rangedAttack.proficiency": {
		type: [Schemas.Effect],
		defaultValue: [{_id: Random.id(),name: "Attack Proficiency",value: 1}]
	},

	dexterityArmor:		{type: Schemas.Skill},
	"dexterityArmor.ability":	{ type: String, defaultValue: "dexterity" }
});