Template.healthBar.helpers({
	hpRed: function(){
		var currentHp = this.attributeValue(this.attributes.hitPoints);
		var damage = this.attributes.hitPoints.base;
		return 100*(currentHp/(currentHp - damage));
	},
	hpGreen: function(){
		var currentHp = this.attributeValue(this.attributes.hitPoints);
		var damage = this.attributes.hitPoints.base;
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
		var currentHp = this.attributeValue(this.attributes.hitPoints);
		var damage = this.attributes.hitPoints.base;
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
		var currentHp = this.attributeValue(this.attributes.hitPoints);
		var damage = this.attributes.hitPoints.base;
		var maxHp = currentHp - damage;
		var percent =  100*(currentHp/ maxHp);
		var change = 100 * Template.instance().deltaHp.get() / maxHp;
		return percent + change;
	},
	maxHp: function(){
		var currentHp = this.attributeValue(this.attributes.hitPoints);
		var damage = this.attributes.hitPoints.base;
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

Template.healthBar.events({
	"dragstart .healthBar": function(event) {
		Template.instance().startDrag = new ReactiveVar(Template.instance().deltaHp.get());
	},
	"drag": function(event, templateInstance, handler){
		//the width of the bar, fetch dynamically if needed
		var healthBarWidth = 240;
		var hpLeft = this.attributeValue(this.attributes.hitPoints)
		var damage = this.attributes.hitPoints.base
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
		var damage = this.attributes.hitPoints.base
		newValue = newValue < -damage ? newValue : -damage;
		//set value
		Template.instance().deltaHp.set(newValue);
	},
	"click .healthBarMinus": function(event){
		var newValue = Template.instance().deltaHp.get() - 1;
		//dont damage more than hit points left
		var hpLeft = this.attributeValue(this.attributes.hitPoints)
		newValue = newValue > -hpLeft ? newValue : -hpLeft;
		//set value
		Template.instance().deltaHp.set(newValue);
	},
	"click #applyDelta": function(event){
		Characters.update(this._id, {$inc: {"attributes.hitPoints.base": Template.instance().deltaHp.get()}})
		Template.instance().deltaHp.set(0);
	}
});