Router.map( function () {
  	this.route('home', {
  		path: '/',
		data: { characters: function(){
					console.log('id ' + Meteor.userId());
					return Characters.find({owner: Meteor.userId()}) 
				}
			  }
	});
	
	this.route('character', {
  		path: '/character/:_id',
  		notFoundTemplate: 'characterNotFound',
  		data: function() {
			character = Characters.findOne({_id: this.params._id});
			if (character) character.items = Items.find({owner: this.params._id});
			return character;
  		}
	});
});