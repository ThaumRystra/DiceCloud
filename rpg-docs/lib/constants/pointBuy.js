pointBuyCost = {
	"8": 0,
	"9": 1,
	"10": 2,
	"11": 3,
	"12": 4,
	"13": 5,
	"14": 7,
	"15": 9
};

var getPointBuyEffect = function(stat, value, pointsUsed, charId){
	return {
		modifier:{
			charId: charId,
			stat: stat,
			name: pointsUsed + " Point Buy",
			operation: "base",
			value: value,
			type: "inate",
			parent: {collection: "Characters", id: charId},
			enabled: true,
		},
		selector:{
			charId: charId,
			stat: stat,
			operation: "base",
			type: "inate"
		}
	};
};

var checkPermission = function(userId, charId){
	var char = Characters.findOne( charId, { fields: {owner: 1, writers: 1} } );
	if(!char)
		throw new Meteor.Error('Access Denied',
							   'Character '+charId+' does not exist');
	if (!userId)
		throw new Meteor.Error('Access Denied',
							   'No UserId set when trying to update character asset.');
	if (char.owner !== userId && !_.contains(char.writers, userId))
		throw new Meteor.Error('Access Denied',
							   'Not permitted to update assets of this character.');
	return true;
};

Meteor.methods({
	pointBuyAbilityScores: function(charId, points){
		check(points, {
			strength:     Number,
			dexterity:    Number,
			constitution: Number,
			intelligence: Number,
			wisdom:       Number,
			charisma:     Number
		});
		check(charId, String);
		checkPermission(this.userId, charId);
		var pointsUsed = 0;
		_.each(points, function(value, key){
			pointsUsed += pointBuyCost[value];
		});
		_.each(points, function(value, ability){
			var pbEffect = getPointBuyEffect(ability, value, pointsUsed, charId);
			Effects.upsert(pbEffect.selector, pbEffect.modifier);
		});
	}
});
