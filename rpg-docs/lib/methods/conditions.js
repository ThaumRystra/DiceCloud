var checkWritePermission = function(charId) {
	if (!Meteor.call("canWriteCharacter", charId)){
		throw new Meteor.Error(
			"Access denied",
			"You do not have permission to edit the assets of this character"
		);
	}
};

var getCondition = function(conditionName) {
	//get condition from constant
	var condition = CONDITIONS[conditionName];
	//check that condition exists
	if (!condition) {
		throw new Meteor.Error(
			"Invalid condition",
			conditionName + " is not a known condition"
		);
	}
	return condition;
};

Meteor.methods({
	giveCondition: function(charId, conditionName) {
		// here, the "buff" is the thing that gets inserted into the Conditions collection,
		// and the "condition" is the template for the condition. This is to (hopefully)
		// avoid confusion. Emphasis on "hopefully".

		checkWritePermission(charId);
		var condition = getCondition(conditionName);
		//create the buff
		var buff = _.extend(
			{charId: charId, type: "inate"}, condition.buff
		);

		//make sure the character doesn't already have the buff
		var existingBuffs = Conditions.find(_.clone(buff)).count();
		if (existingBuffs) return;
		//remove exclusive conditions
		_.each(condition.exclusiveConditions, function(exCond) {
			Meteor.call("removeCondition", charId, exCond);
		});
		//insert the buff
		var buffId = Conditions.insert(buff);
		//extend and insert each effect
		_.each(condition.effects, function(effect) {
			var newEffect = {
				stat: effect.stat,
				operation: effect.operation,
				calculation: effect.calculation,
				value: effect.value,
				charId: charId,
				parent: {
					id: buffId,
					collection: "Conditions",
				},
				enabled: true,
			};
			//we know these effects are right,
			//skip after hooks, skip validation
			Effects.direct.insert(
				newEffect,
				{
					validate: false,
					filter: false,
					autoConvert: false,
					removeEmptyStrings: false,
				}
			);
		});
		//recurse for subConditions
		_.each(condition.subConditions, function(subCondition) {
			Meteor.call("giveCondition", charId, subCondition);
		});
	},
	removeCondition: function(charId, conditionName) {
		checkWritePermission(charId);
		var condition = getCondition(conditionName);
		//remove the buff
		var buff = _.extend(
			{charId: charId}, condition.buff
		);
		Conditions.remove(buff);
		//dont remove the effects, they get removed automatically through parenting
	},
	getConditions: function() {
		return Object.keys(CONDITIONS);
	},
	getConditionName: function(conditionName) {
		//get condition from constant
		var condition = CONDITIONS[conditionName];
		//check that condition exists
		if (!condition) {
			throw new Meteor.Error(
				"Invalid condition",
				conditionName + " is not a known condition"
			);
		}
		return condition.buff.name;
	},
});

trackEncumbranceConditions = function(charId, templateInstance) {
	templateInstance.autorun(function() {
		//get weight
		var weight = 0;
		Containers.find(
			{charId: charId, isCarried: true},
			{fields: {weight: 1}}
		).forEach(function(container){
			weight += container.totalWeight();
		});
		Items.find(
			{charId: charId, "parent.id": charId},
			{fields: {weight : 1, quantity: 1}}
		).forEach(function(item){
			weight += item.totalWeight();
		});
		var character = Characters.findOne(
			charId,
			{fields: {"settings": 1}}
		);
		var strength = Characters.calculate.attributeValue(charId, "strength");
		var carryMultiplier = Characters.calculate
			.attributeValue(charId, "carryMultiplier");
		var give = function(condition) {
			Meteor.call("giveCondition", charId, condition);
		};
		var remove = function(condition) {
			Meteor.call("removeCondition", charId, condition);
		};
		//variant encumbrance rules
		if (weight > strength * 10 * carryMultiplier &&
			character.settings.useVariantEncumbrance) {
			give("encumbered2");
			remove("encumbered");
		} else if (weight > strength * 5 * carryMultiplier &&
					character.settings.useVariantEncumbrance){
			give("encumbered");
			remove("encumbered2");
		} else {
			remove("encumbered");
			remove("encumbered2");
		}
		//normal encumbrance rules
		if (weight > strength * 30 * carryMultiplier &&
			character.settings.useStandardEncumbrance){
			give("encumbered4");
			remove("encumbered3");
		} else if (weight > strength * 15 * carryMultiplier &&
				character.settings.useStandardEncumbrance) {
			give("encumbered3");
			remove("encumbered4");
		} else {
			remove("encumbered3");
			remove("encumbered4");
		}
	});
};
