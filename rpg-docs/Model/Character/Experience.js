Experience = function(){
	this.total = 0;
	this.events = [];
	this.level = 0;
}

Experience.prototype.addEvent = function(description, value){
	this.events.push({
		"description": description,
		"value": value
	})
	this.total += value;
	this.level = this.getLevel();
}

Experience.prototype.removeEvent = function(index){
	this.total -= this.events[index].value;
	this.events.splice(index,1);
	this.level = this.getLevel();
}

Experience.prototype.refreshTotal  = function(){
	this.total = 0;
	for(var i = 0, length = this.events.length; i < length; i++){
		this.total += this.events[i].value;
	}
	this.level = this.getLevel();
}

Experience.prototype.getLevel = function(){
	var xp = this.total;
	if(xp > 355000) return 20;
	if(xp > 305000) return 19;
	if(xp > 265000) return 18;
	if(xp > 225000) return 17;
	if(xp > 195000) return 16;
	if(xp > 165000) return 15;
	if(xp > 140000) return 14;
	if(xp > 120000) return 13;
	if(xp > 100000) return 12;
	if(xp >  85000) return 11;
	if(xp >  64000) return 10;
	if(xp >  48000) return  9;
	if(xp >  34000) return  8;
	if(xp >  23000) return  7;
	if(xp >  14000) return  6;
	if(xp >   6500) return  5;
	if(xp >   2700) return  4;
	if(xp >    900) return  3;
	if(xp >    300) return  2;
	                return  1;
}