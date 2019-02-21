PatreonPosts = new Mongo.Collection("patreonPosts");

Schemas.PatreonPosts = new SimpleSchema({
	link: {
    type: String,
  },
  dateAdded: {
    type: Date,
    autoValue(){
      return new Date();
    },
  },
});

PatreonPosts.attachSchema(Schemas.PatreonPosts);

PatreonPosts.allow({
	insert: function(userId, doc) {
		var user = Meteor.users.findOne(userId);
		if (user) return _.contains(user.roles, "admin");
	},
	remove: function(userId, doc) {
		var user = Meteor.users.findOne(userId);
		if (user) return _.contains(user.roles, "admin");
	},
});
