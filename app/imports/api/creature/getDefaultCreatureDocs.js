import DEFAULT_CHARACTER_STATS from '/imports/api/creature/DEFAULT_CHARACTER_STATS.js';

getDefaultCreatureDocs = function(charId, creatureType = "pc"){
  // Setup the docs object which will be returned
  let docs = {
    attributes: [],
    skills: [],
    damageMultipliers: [],
    effects: []
  };

  // Get the default character stats
  let stats;
  if (creatureType === "pc"){
    stats = DEFAULT_CHARACTER_STATS;
  } else {
    stats = null;
    throw new Meteor.Error("Not implemented",
      "Default stats for non-player characters aren't implemented yet");
  }

  // Setup the variables we'll need to share
	let order = 0;
	const baseParent = {
		collection: "Characters",
		id: charId,
		group: "default",
	};
	let name, variableName, parent, attribute, skill, dm, type, baseValue;

  // Attributes
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

  // Skills
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

  // Damage Multipliers
  order = 0;
	for (let i in stats.damageMultipliers){
		dm = stats.damageMultipliers[i];
		docs.damageMultipliers.push({
      _id: Random.id,
			charId,
      order,
			name: dm.name,
			variableName: dm.variableName,
			parent: _.clone(baseParent),
		});
    order++;
	}

  // Effects
  order = 0;
  for (let i in stats.effects){
    eff = stats.effects[i];
    docs.effects.push({
      _id: Random.id,
			charId,
      order,
			name: eff.name,
      stat: eff.stat,
      operation: eff.operation,
      calculation:eff.calculation,
    });
    order++;
  }
  return docs;
}

export default getDefaultCreatureDocs;
