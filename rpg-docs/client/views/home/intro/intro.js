Template.intro.events({
	"tap .signInButton": function() {
		Router.go("/sign-in");
	},
	"tap .signUpButton": function() {
		Router.go("/sign-up");
	},
	"tap .ssArcher": function() {
		Router.go("/character/yBWwt5XQTTHZiRQxq");
	},
	"tap .ssWizard": function() {
		Router.go("/character/KxHKskm22fS2Xogah");
	},
	"tap .guideButton": function() {
		Router.go("/guide");
	},
});
