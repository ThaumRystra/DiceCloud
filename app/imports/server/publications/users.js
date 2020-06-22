import SimpleSchema from 'simpl-schema';
import '/imports/api/users/Users.js';
import Invites from '/imports/api/users/Invites.js';

Meteor.publish('user', function(){
	return [
    Meteor.users.find(this.userId, {fields: {
      roles: 1,
      username: 1,
      apiKey: 1,
      darkMode: 1,
      subscribedLibraries: 1,
      profile: 1,
      preferences: 1,
      'services.patreon.id': 1,
      'services.patreon.entitledCents': 1,
      'services.patreon.entitledCentsOverride': 1,
      'services.google.id': 1,
      'services.google.picture': 1,
      'services.google.name': 1,
      'services.google.email': 1,
      'services.google.locale': 1,
    }}),
    Invites.find({
      $or: [
        {inviter: this.userId},
        {invitee: this.userId}
      ],
    }, {
      fields: {
        inviteToken: 0,
      }
    }),
  ];
});

let userIdsSchema = new SimpleSchema({
  ids: {
    type: Array,
    optional: true,
  },
  'ids.$':{
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  }
})

Meteor.publish('userPublicProfiles', function(ids){
  userIdsSchema.validate({ids});
	if (!this.userId || !ids) return this.ready();
	return Meteor.users.find({
		_id: {$in: ids}
	},{
		fields: {username: 1},
		sort: {username: 1},
	});
});
