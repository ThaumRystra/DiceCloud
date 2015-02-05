Router.configure({
	loadingTemplate: 'loading',
	layoutTemplate: 'layout'
});

Router.map( function () {
	this.route('home',
			   {
		path: '/',
		waitOn: function(){
			return Meteor.subscribe("characterList", Meteor.userId());
		},
		data: {
			characters: function(){
				return Characters.find({}, {fields: {_id: 1}});
			}
		}
	});

	this.route('characterSheet', {
		path: '/character/:_id',
		waitOn: function(){
			return [
				Meteor.subscribe("singleCharacter", this.params._id, Meteor.userId()),
				];
		},
		data: function() {
			var data = Characters.findOne({_id: this.params._id}, {fields: {_id: 1}});
			return data;
		}
	});

	this.route('inventory', {
		path: '/inventory/:_id',
		data: {
			containers: function() {
				var containers = Containers.find({owner: data._id}, {fields: {_id: 1}});
				return containers;
			},

		}
	});

	this.route('item', {
		path: '/item/:_id',
		data: function() {
			var data = Items.findOne({_id: this.params._id});
			return data;
		}
	});
	
	this.route('loading', {
		path: '/loading'
	});
});