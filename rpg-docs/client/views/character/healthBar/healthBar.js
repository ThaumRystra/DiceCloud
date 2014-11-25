Template.healthBar.helpers({
	healthy: function(){
		var hp = this.attributeValue("hitPoints");
		return hp > 0;
	},
	dead: function(){
		var deathSave = this.getField("deathSave");
		if(deathSave.canDeathSave){
			return deathSave.fail >= 3;
		} else{
			//creatures that can't make death saves die at 0 HP
			var hp = this.attributeValue("hitPoints");
			return hp <= 0;
		}
	}
});

Template.hitPointBars.helpers({
	hpRed: function(){
		var currentHp = this.attributeValue("hitPoints");
		var damage = this.getField("hitPoints").base;
		return 100*(currentHp/(currentHp - damage));
	},
	hpGreen: function(){
		var currentHp = this.attributeValue("hitPoints");
		var damage = this.getField("hitPoints").base;
		var maxHp = currentHp - damage;
		var percent =  100*(currentHp/ maxHp);
		var change = 100 * Template.instance().deltaHp.get() / maxHp;
		if(change < 0){
			return percent + change;
		}else{
			return percent;
		}
	},
	hpYellow: function(){
		var currentHp = this.attributeValue("hitPoints");
		var damage = this.getField("hitPoints").base;
		var maxHp = currentHp - damage;
		var percent =  100*(currentHp/ maxHp);
		var change = 100 * Template.instance().deltaHp.get() / maxHp;
		if(change > 0){
			return percent + change;
		} else{
			return percent;
		}
	},
	hpPercentDelta: function(){
		if(!Template.instance().deltaHp){
			Template.instance().deltaHp = new ReactiveVar(0);
		}
		var currentHp = this.attributeValue("hitPoints");
		var damage = this.getField("hitPoints").base;
		var maxHp = currentHp - damage;
		var percent =  100*(currentHp/ maxHp);
		var change = 100 * Template.instance().deltaHp.get() / maxHp;
		return percent + change;
	},
	maxHp: function(){
		var currentHp = this.attributeValue("hitPoints");
		var damage = this.getField("hitPoints").base;
		return currentHp - damage;
	},
	deltaHp: function(){
		if(!Template.instance().deltaHp){
			Template.instance().deltaHp = new ReactiveVar(0);
		}
		return Template.instance().deltaHp.get();
	},
	showDelta: function(){
		if(Template.instance().deltaHp){
			if(Template.instance().deltaHp.get() !== 0) return "initial";
		}
		return "none";
	}
});

Template.hitPointBars.events({
	"dragstart .healthBar": function(event) {
		Template.instance().startDrag = new ReactiveVar(Template.instance().deltaHp.get());
	},
	"drag": function(event, templateInstance, handler){
		//the width of the bar, fetch dynamically if needed
		var healthBarWidth = 300;
		var hpLeft = this.attributeValue("hitPoints");
		var damage = this.getField("hitPoints").base;
		var maxHp = hpLeft - damage;
		var dragMultiplier = maxHp / healthBarWidth; 
		var newValue = dragMultiplier * handler.deltaX + Template.instance().startDrag.get();
		//don't heal more than -damage
		newValue = newValue < -damage ? newValue : -damage;
		//dont damage more than hit points left
		newValue = newValue > -hpLeft ? newValue : -hpLeft;
		//floor the value
		newValue = Math.floor(newValue);
		//set the value
		Template.instance().deltaHp.set(newValue);
	},
	"click .healthBarPlus": function(event){
		var newValue = Template.instance().deltaHp.get() + 1;
		//don't heal more than -damage
		var damage = this.getField("hitPoints").base;
		newValue = newValue < -damage ? newValue : -damage;
		//set value
		Template.instance().deltaHp.set(newValue);
	},
	"click .healthBarMinus": function(event){
		var newValue = Template.instance().deltaHp.get() - 1;
		//dont damage more than hit points left
		var hpLeft = this.getField("hitPoints").base;
		newValue = newValue > -hpLeft ? newValue : -hpLeft;
		//set value
		Template.instance().deltaHp.set(newValue);
	},
	"click #applyDelta": function(event){
		Characters.update(this._id, {$inc: {"hitPoints.base": Template.instance().deltaHp.get()}})
		Template.instance().deltaHp.set(0);
	}
});

Template.deadBar.events({
	"click .deadText": function(){
		Characters.update(this._id, {$set: {"deathSave.fail": 0}});
		Characters.update(this._id, {$set: {"deathSave.pass": 0}});
	}
});

Template.deathSaves.helpers({
	deathFailGT: function(num){
		var deathSave = this.getField("deathSave");
		if(deathSave.fail > num) return "tickedDeathFail";
		else return "untickedDeathFail";
	},
	deathPassGT: function(num){
		var deathSave = this.getField("deathSave");
		if(deathSave.pass > num) return "tickedDeathPass";
		else return "untickedDeathPass";
	},
	stable: function(){
		var deathSave = this.getField("deathSave");
		if(deathSave.pass > 0 || deathSave.fail > 0){
			return "stability";
		} else{
			return "heal";
		}
	},
	stabilizeText: function(){
		var deathSave = this.getField("deathSave");
		if(deathSave.pass > 0 || deathSave.fail > 0){
			return "stabilize";
		} else{
			return "heal";
		}
	}
});

Template.deathSaves.events({
	"click .stability": function(){
		Characters.update(this._id, {$set: {"deathSave.fail": 0}});
		Characters.update(this._id, {$set: {"deathSave.pass": 0}});
	},
	"click .heal": function(){
		Characters.update(this._id, {$inc: {"hitPoints.base": 1}});
	},
	"click .untickedDeathFail" : function(){
		Characters.update(this._id, {$inc: {"deathSave.fail": 1}});
	},
	"click .untickedDeathPass" : function(){
		Characters.update(this._id, {$inc: {"deathSave.pass": 1}});
	},
	"click .tickedDeathFail" : function(){
		Characters.update(this._id, {$inc: {"deathSave.fail": -1}});
	},
	"click .tickedDeathPass" : function(){
		Characters.update(this._id, {$inc: {"deathSave.pass": -1}});
	}
});