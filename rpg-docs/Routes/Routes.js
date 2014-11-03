Router.map( function () {
	this.route('home', 
			   {
		path: '/',
		data: { 
			characters: function(){
				return Characters.find({owner: Meteor.userId()}) 
			}
		}
	});

	this.route('character', {
		path: '/character/:_id',
		notFoundTemplate: 'characterNotFound',
		data: function() {
			var data = Characters.findOne({_id: this.params._id});
			data.features = Features.find({character: data._id});
			var newInstance = Object.create(protoCharacter);
			data = _.extend(newInstance, data);
			return data;
		}
	});
});