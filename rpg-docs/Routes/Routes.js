Router.configure({
	loadingTemplate: "loading",
	layoutTemplate: "layout",
});

Router.plugin("ensureSignedIn", {
	except: [
		"home",
		"characterSheet",
		"atSignIn",
		"atSignUp",
		"atForgotPassword",
		"atResetPwd",
		"atEnrollAccount",
		"atVerifyEmail",
		"atResendVerificationEmail",
		"loginButtons",
		"notFound",
	]
});

Router.plugin("dataNotFound", {notFoundTemplate: "notFound"});

Router.map(function() {
	this.route("/", {
		name: "home",
		onAfterAction: function() {
			document.title = appName;
		},
	});

	this.route("characterList", {
		path: "/characterList",
		waitOn: function(){
			return subsManager.subscribe("characterList", Meteor.userId());
		},
		data: {
			characters: function(){
				return Characters.find({}, {fields: {_id: 1}});
			}
		},
		onAfterAction: function() {
			document.title = appName;
		},
	});

	this.route("characterSheet", {
		path: "/character/:_id",
		waitOn: function(){
			return [
				subsManager.subscribe("singleCharacter", this.params._id, Meteor.userId()),
			];
		},
		data: function() {
			var data = Characters.findOne(
				{_id: this.params._id},
				{fields: {_id: 1, name: 1, color: 1, writers: 1, readers: 1}}
			);
			return data;
		},
		onAfterAction: function() {
			var char = Characters.findOne({_id: this.params._id}, {fields: {name: 1}});
			var name = char && char.name;
			if (name){
				document.title = name;
			}
		},
	});

	this.route("loading", {
		path: "/loading"
	});

	this.route("profile", {
		path: "/account",
		onAfterAction: function() {
			document.title = appName + " Account";
		},
	});

	this.route("/changelog", {
		name: "changeLog",
		waitOn: function() {
			return [
				subsManager.subscribe("changeLog"),
			]
		},
		data: {
			changeLogs: function() {
				return ChangeLogs.find({}, {sort: {version: -1}});
			}
		},
		onAfterAction: function() {
			document.title = appName;
		},
	});
});
