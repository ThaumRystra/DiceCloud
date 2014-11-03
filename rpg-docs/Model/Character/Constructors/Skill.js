//Skills are bonuses to rolls: "+2" etc.
//They are based off of some ability
Skill = function(ability){
	//proficiencies of the form {name: "Jack of all Trades", value: 0.5}
	//only the highest is used
	this.proficiency = []; 
	//ability name that this skill uses as base for roll
	this.ability = ability;
	this.add = [];
	this.mul = [];
	this.min = [];
	this.max = [];
	this.advantage = []; //effects granting advantage
	this.disadvantage = [];
	this.passiveAdd = []; //only added to passive checks
	this.fail = []; //all checks are failed
	this.conditional = []; //conditional modifiers
}