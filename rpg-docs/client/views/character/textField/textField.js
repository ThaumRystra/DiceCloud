Template.textField.created = function(){
	Template.instance().editing = new ReactiveVar(false);
	document.execCommand('defaultParagraphSeparator', false, 'div');
}

Template.textField.helpers({
	editing: function(){
		return Template.instance().editing.get();
	},
	input: function(){
		var text = this.character.strings[this.field];
		if (_.isString(text)) return Spacebars.SafeString(text);
		return text;
	},
	output: function(){
		var html = evaluateString(this.character, this.character.strings[this.field]);
		if (_.isString(html)) return Spacebars.SafeString(html);
		return html;
	},
	outputClass: function(){
		if(Template.instance().editing.get()){
			return "editing";
		} else{
			return "notEditing"
		}
	}
})

Template.textField.events({
	"blur #textInput": function(){
		Template.instance().editing.set(false);
		var text = $("#textInput").html();
		if(!_.isString(text)) text = "";
		//TODO sanitise the html
		var setter = {};
		setter["strings."+this.field] = text;
		Characters.update(this.character._id, {$set: setter}, function(error, result) {
			if(error) console.log(error);
		});
	},
	"click #textOutput": function(){
		Template.instance().editing.set(true);
		Tracker.afterFlush(function(){
			$("#textInput").focus();
		});
	}
})