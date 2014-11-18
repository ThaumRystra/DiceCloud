Schemas.Proficiency = new SimpleSchema({
	name: 	{type: String},
	source: {type: String}
})

Schemas.Proficiencies = new SimpleSchema({
	weapons: {
		type: [Schemas.Proficiency], 
		defaultValue: []
	},
	tools: {
		type: [Schemas.Proficiency],
		defaultValue: []
	},
	languages: {
		type: [Schemas.Proficiency], 
		defaultValue: []
	}
});