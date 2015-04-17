Router.configure({
	loadingTemplate: 'loading',
	layoutTemplate: 'layout'
});

Router.map( function () {
	/*
	this.route('home', {
		path: '/',
		waitOn: function(){
			return Meteor.subscribe("characterList", Meteor.userId());
		},
		data: {
			characters: function(){
				return Characters.find({}, {fields: {_id: 1}});
			}
		}
	});*/ //add a home route and change characterList route

	this.route('characterList', {
		path: '/',
		waitOn: function(){
			return Meteor.subscribe("characterList", Meteor.userId());
		},
		data: {
			characters: function(){
				return Characters.find({}, {fields: {_id: 1}});
			}
		},
		onAfterAction: function() {
			document.title = appName;
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
			var data = Characters.findOne({_id: this.params._id}, {fields: {_id: 1, name: 1, color: 1}});
			return data;
		},
		onAfterAction: function() {
			var char = Characters.findOne({_id: this.params._id}, {fields: {name: 1}});
			var name = char && char.name;
			if(name){
				document.title = name;
			}
		}
	});

	this.route('loading', {
		path: '/loading'
	});

	this.route('profile', {
		path: '/account',
		onAfterAction: function() {
			document.title = appName + " Account";
		}
	});
});