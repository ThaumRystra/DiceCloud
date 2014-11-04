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
			data.containers = Containers.find({owner: data._id});
			data.containers.forEach(function(container){
				container.items = Items.find({container: container._id});
			});
			var newInstance = Object.create(protoCharacter);
			data = _.extend(newInstance, data);
			return data;
		}
	});

	this.route('inventory', {
		path: '/inventory/:_id',
		notFoundTemplate: 'characterNotFound',
		data: {
			containers: function() {
				var containers = Containers.find({owner: data._id});
				containers.forEach(function(container){
					container.items = Items.find({container: container._id});
				});
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