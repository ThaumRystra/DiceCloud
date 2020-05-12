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
      'services.patreon.id': 1,
      'services.patreon.entitledCents': 1,
      'services.patreon.entitledCentsOverride': 1,
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

Meteor.publish('userPublicProfiles', function(ids){
	if (!this.userId || !Array.isArray(ids)) return [];
	return Meteor.users.find({
		_id: {$in: ids}
	},{
		fields: {username: 1},
		sort: {username: 1},
	});
});
