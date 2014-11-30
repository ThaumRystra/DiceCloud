Schemas.Skill = new SimpleSchema({
	//attribute name that this skill used as base mod for roll
	ability: { type: String, defaultValue: "" },
	effects: { type: [Schemas.Effect], defaultValue: [] },
});