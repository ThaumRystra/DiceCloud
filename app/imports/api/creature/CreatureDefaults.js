getDefaultCreatureDocs = function(charId, creatureType = "pc"){
  let docs = {attributes: [], skills: [], damageMultipliers: [], effects: []};
  if (creatureType === "pc"){
    const stats = DEFAULT_CHARACTER_STATS;
  } else {
    throw new Meteor.Error("Not implemented",
      "Default stats for non-player characters aren't implemented yet");
  }
	let order = 0;
	const baseParent = {
		collection: "Characters",
		id: charId,
		group: "default",
	};
	let name, variableName, parent, attribute, skill, ability, dm, type, baseValue;
	for (type in stats.attributes){
		for (let i in stats.attributes[type]){
			attribute = stats.attributes[type][i];
			if (_.isString(attribute)){
				name = attribute;
				variableName = attribute.toLowerCase();
			} else {
				name = attribute.name;
				variableName = attribute.variableName;
			}
      baseValue = attribute.baseValue;
			parent = _.clone(baseParent);
			docs.attributes.push({
        _id: Random.id,
				charId, name, variableName, order, type, parent, baseValue,
			});
			order++;
		}
	}
	order = 0;
	for (type in stats.skills){
		for (let i in stats.skills[type]){
			skill = stats.skills[type][i];
			docs.skills.push({
        _id: Random.id,
				charId,
				type,
				order,
				name: skill.name,
				variableName: skill.variableName,
				ability: skill.ability,
				parent: _.clone(baseParent),
			});
			order++;
		}
	}
	for (let i in stats.damageMultipliers){
		dm = stats.damageMultipliers[i];
		docs.damageMultipliers.push({
      _id: Random.id,
			charId,
			name: dm.name,
			variableName: dm.variableName,
			parent: _.clone(baseParent),
		});
	}
  for (let i in stats.effects){
    eff = stats.effects[i];
    docs.effects.push({
      _id: Random.id,
			charId,
			name: eff.name,
      stat: eff.stat,
      operation: eff.operation,
      calculation:eff.calculation,
    });
  }
  return docs;
}

export default getDefaultCreatureDocs;
