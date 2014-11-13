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

Schemas.Attributes = new SimpleSchema({
	strength:			{type: Schemas.Attribute},
	dexterity:			{type: Schemas.Attribute},
	constitution:		{type: Schemas.Attribute},
	intelligence:		{type: Schemas.Attribute},
	wisdom:				{type: Schemas.Attribute},
	charisma:			{type: Schemas.Attribute},
	hitPoints:			{type: Schemas.Attribute},
	experience:			{type: Schemas.Attribute},
	proficiencyBonus:	{type: Schemas.Attribute},
	speed:				{type: Schemas.Attribute},
	weight: 			{type: Schemas.Attribute},
	weightCarried: 		{type: Schemas.Attribute},
	age: 				{type: Schemas.Attribute},
	ageRate: 			{type: Schemas.Attribute},
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
	armor:				{type: Schemas.Attribute},
	"armor.add": {
		type: [Schemas.Effect],
		defaultValue: [
			new Effect("Dexterity Modifier", "skillMod skills.dexterityArmor")
		]
	}
});