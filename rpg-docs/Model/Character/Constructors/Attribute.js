//Attributes are numerical values
Attribute = function(base){
	//the unmodified value of the attribute
	//should be zero for most attributes after a long rest
	this.base = base; 
	//effects of the form {name: "Ring of Protection", value: 1}
	this.add = []; //bonuses added to the attribute
	this.mul = []; //multipliers to the attribute (after adding bonuses)
	this.min = []; //effects setting the minimum value of the attribute
	this.max = []; //effects setting the maximum value of the attribute
	this.conditional = []; //conditional modifiers
}