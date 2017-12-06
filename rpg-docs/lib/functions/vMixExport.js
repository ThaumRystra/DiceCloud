vMixCharacter = function(charId){
	return JSON.stringify([characterExport(charId)], null, 2);
};

vMixParty = function(partyId){
	var party = Parties.findOne(partyId);
	var chars = _.map(party.characters, charId => characterExport(charId));
	return JSON.stringify(chars, null, 2);
};
