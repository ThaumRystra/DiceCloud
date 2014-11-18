Schemas.Attribute = new SimpleSchema({
	//the unmodified value of the attribute
	//should be zero for most attributes after a long rest
	base: {
		type: Number,
		defaultValue: 0
	},
	//effect arrays
	add: 		{ type: [Schemas.Effect], defaultValue: [] },
	mul: 		{ type: [Schemas.Effect], defaultValue: [] },
	min: 		{ type: [Schemas.Effect], defaultValue: [] },
	max: 		{ type: [Schemas.Effect], defaultValue: [] },
	conditional:{ type: [Schemas.Effect], defaultValue: [] }
});

//note to make an invulnerability add a new max of zero value
Schemas.Vulnerability = new SimpleSchema({
	//same as attribute
	base: {
		type: Number,
		defaultValue: 0
	},
	//effect arrays
	add: 		{ type: [Schemas.Effect], defaultValue: [] },
	mul: 		{ type: [Schemas.Effect], defaultValue: [] },
	min: 		{ type: [Schemas.Effect], defaultValue: [{name: "Resistance doesn't stack", value: 0.5}] },
	max: 		{ type: [Schemas.Effect], defaultValue: [{name: "Vulnerability doesn't stack", value:  2}] },
	conditional:{ type: [Schemas.Effect], defaultValue: [] },
});

Schemas.Attributes = new SimpleSchema({
	//ability scores
	strength:			{type: Schemas.Attribute},
	dexterity:			{type: Schemas.Attribute},
	constitution:		{type: Schemas.Attribute},
	intelligence:		{type: Schemas.Attribute},
	wisdom:				{type: Schemas.Attribute},
	charisma:			{type: Schemas.Attribute},
	
	//stats
	hitPoints:			{type: Schemas.Attribute},
	experience:			{type: Schemas.Attribute},
	proficiencyBonus:	{type: Schemas.Attribute},
	speed:				{type: Schemas.Attribute},
	weight: 			{type: Schemas.Attribute},
	weightCarried: 		{type: Schemas.Attribute},
	age: 				{type: Schemas.Attribute},
	ageRate: 			{type: Schemas.Attribute},
	armor:				{type: Schemas.Attribute},
	"armor.add": {
		type: [Schemas.Effect],
		defaultValue: [
			{name: "Dexterity Modifier", calculation: "dexterityArmor"}
		]
	},
	
	//resources
	level1SpellSlots:	{type: Schemas.Attribute},
	level2SpellSlots:	{type: Schemas.Attribute},
	level3SpellSlots:	{type: Schemas.Attribute},
	level4SpellSlots:	{type: Schemas.Attribute},
	level5SpellSlots:	{type: Schemas.Attribute},
	level6SpellSlots:	{type: Schemas.Attribute},
	level7SpellSlots:	{type: Schemas.Attribute},
	level8SpellSlots:	{type: Schemas.Attribute},
	level9SpellSlots:	{type: Schemas.Attribute},
	ki:					{type: Schemas.Attribute},
	sorceryPoints:		{type: Schemas.Attribute},
	rages:				{type: Schemas.Attribute},
	
	
	//hit dice
	d6HitDice:				{type: Schemas.Attribute},
	d8HitDice:				{type: Schemas.Attribute},
	d10HitDice:				{type: Schemas.Attribute},
	d12HitDice:				{type: Schemas.Attribute},
	
	//vulnerabilities
	acidMultiplier:			{type: Schemas.Vulnerability},
	bludgeoningMultiplier:	{type: Schemas.Vulnerability},
	coldMultiplier:			{type: Schemas.Vulnerability},
	fireMultiplier:			{type: Schemas.Vulnerability},
	forceMultiplier:		{type: Schemas.Vulnerability},
	lightningMultiplier:	{type: Schemas.Vulnerability},
	necroticMultiplier:		{type: Schemas.Vulnerability},
	piercingMultiplier:		{type: Schemas.Vulnerability},
	poisonMultiplier:		{type: Schemas.Vulnerability},
	psychicMultiplier:		{type: Schemas.Vulnerability},
	radiantMultiplier:		{type: Schemas.Vulnerability},
	slashingMultiplier:		{type: Schemas.Vulnerability},
	thunderMultiplier:		{type: Schemas.Vulnerability},
});