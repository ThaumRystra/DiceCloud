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
			return data;
		}
	});

	this.route('inventory', {
		path: '/inventory/:_id',
		notFoundTemplate: 'characterNotFound',
		data: {
			containers: function() {
				var containers = Containers.find({owner: data._id});
				return containers;
			},

		}
	});

	this.route('item', {
		path: '/item/:_id',
		notFoundTemplate: 'itemNotFound',
		data: function() {
			var data = Items.findOne({_id: this.params._id});
			return data;
		}
	});
});