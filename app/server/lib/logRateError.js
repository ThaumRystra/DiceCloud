logRateError = function(reply, ruleInput){
	// reply = {allowed, timeToReset, numInvocationsLeft}
	// ruleInput = {userId, clientAddress, type, name, connectionId}
	console.log(
		`Limit hit for ${ruleInput.type} "${ruleInput.name}" ` +
		`by user ${ruleInput.userId} from ${ruleInput.clientAddress}`
	);
}
