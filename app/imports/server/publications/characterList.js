import Creatures from '/imports/api/creature/Creatures.js';
import Parties from '/imports/api/campaign/Parties.js';

Meteor.publish('characterList', function(){
  this.autorun(function (){
    var userId = this.userId;
    if (!userId) {
      return this.ready();
    }
    const user = Meteor.users.findOne(this.userId, {
      fields: {subscribedCharacters: 1}
    });
    const subs = user && user.subscribedCharacters || [];
    return [
        Creatures.find({
          $or: [
            {readers: userId},
            {writers: userId},
            {owner: userId},
            {_id: {$in: subs}},
          ],
          type: 'pc',
        }, {
          fields: {
            name: 1,
            initial: 1,
            alignment: 1,
            gender: 1,
            readers: 1,
            writers:1,
            owner: 1,
            color: 1,
            picture: 1,
            avatarPicture: 1,
            public: 1,
          }
        }
      ),
      Parties.find({owner: userId}),
    ];
  });
});
