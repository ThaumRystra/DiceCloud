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