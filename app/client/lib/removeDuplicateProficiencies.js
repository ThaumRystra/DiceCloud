removeDuplicateProficiencies = function(proficiencies) {
	dict = {};
	proficiencies.forEach(function(prof) {
		if (prof.name in dict) { //if we have already gone over another proficiency for the same thing
			if (dict[prof.name].value < prof.value) {
				dict[prof.name] = prof; //then take the new one if it's higher, otherwise leave it
			}
		} else {
			dict[prof.name] = prof; //if it wasn't already there, store it
		}
	});
	profs = []
	_.forEach(dict, function(prof) {
		profs.push(prof);
	})
	return profs;
};
